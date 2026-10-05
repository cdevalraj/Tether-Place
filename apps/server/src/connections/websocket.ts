import crypto from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { deepParseJson } from "common/deepParseJson";
import {
	isSocketData,
	type SocketBroadcast,
	type SocketMulticast,
	type SocketUnicast,
	type UUID,
} from "common/types/network";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import {
	authenticate,
	isAuthenticateError,
} from "../middleware/token-authentication.ts";
import type { RequestUser } from "../types/network.ts";
import { publisher, subscriber } from "./redis.ts";

// ==========================================
// types
// ==========================================

interface UpgradeIncomingMessage extends IncomingMessage {
	user: RequestUser;
}

type SubscriberMessageData = SocketUnicast | SocketMulticast | SocketBroadcast;

function isSubscriberMessageData(obj: unknown): obj is SubscriberMessageData {
	return !!obj && typeof obj === "object" && "data" in obj;
}

// ==========================================
// websocket server
// ==========================================
const wss = new WebSocketServer({
	maxPayload: 1024 * 1024,
	noServer: true,
});

// ==========================================
// connections map
// ==========================================
const connections = new Map<UUID, WebSocket>();
const rooms = new Map<string, Set<WebSocket>>();

const generateUUID = () => {
	let uuid = crypto.randomUUID();
	while (connections.has(uuid)) {
		uuid = crypto.randomUUID();
	}
	return uuid;
};

const storeConnectionMap = (socketId: UUID, socket: WebSocket) => {
	if (connections.has(socketId)) return;
	connections.set(socketId, socket);
};

const addSocketToRoom = (roomId: string, socket: WebSocket) => {
	if (!rooms.has(roomId)) {
		rooms.set(roomId, new Set<WebSocket>());
	}
	rooms.get(roomId)?.add(socket);
};

const removeSocketFromRoom = (roomId: string, socket: WebSocket) => {
	const currentRoom = rooms.get(roomId);
	if (currentRoom) {
		currentRoom.delete(socket);
		if (currentRoom.size === 0) {
			rooms.delete(roomId);
		}
		delete socket.roomId;
	}
};

// ==========================================
// connection check
// ==========================================
const pingWebSocketClients = (wsClient: WebSocket) => {
	if (wsClient.isAlive === false) {
		wsClient.terminate();
		return;
	}

	wsClient.isAlive = false;
	wsClient.ping();
};

function heartbeat(this: WebSocket) {
	this.isAlive = true;
}

const heartbeatInterval = setInterval(() => {
	wss.clients.forEach(pingWebSocketClients);
}, 30000);

// ==========================================
// utilities
// ==========================================
const sendJsonData = (socket: WebSocket, payload: object) => {
	if (socket.readyState !== WebSocket.OPEN) return;

	socket.send(JSON.stringify(payload), { binary: false });
};

const publishData = (obj: SubscriberMessageData) => {
	const data = { ...obj.data, fromSocketId: obj.fromSocketId };

	switch (obj.type) {
		case "unicast": {
			const socket = connections.get(obj.toSocketId);
			if (!socket) return;
			sendJsonData(socket, data);

			if (obj.includeSelf) {
				const socket = connections.get(obj.fromSocketId);
				if (!socket) return;
				sendJsonData(socket, data);
			}
			break;
		}
		case "multicast": {
			const sockets = rooms.get(obj.toRoomId);
			if (sockets) {
				sockets.forEach((socket) => {
					if (socket.id !== obj.fromSocketId || obj.includeSelf) {
						sendJsonData(socket, data);
					}
				});
			}
			break;
		}
		case "broadcast": {
			wss.clients.forEach((client) => {
				if (client.id !== obj.fromSocketId || obj.includeSelf) {
					sendJsonData(client, data);
				}
			});
		}
	}
};

const attachMessageListener = async () => {
	try {
		await subscriber.subscribe("ws_message", (data) => {
			const parsedData = deepParseJson(data);
			if (isSubscriberMessageData(parsedData)) {
				publishData(parsedData);
			}
		});
	} catch (error) {
		console.log("Failed to subscribe", error);
	}
};

async function messageHandler(
	this: WebSocket,
	data: RawData,
	isbinary: boolean,
) {
	if (isbinary) {
		return;
	}
	const parsedData = JSON.parse(data.toString());
	if (!isSocketData(parsedData)) {
		return;
	}

	switch (parsedData.type) {
		case "join": {
			try {
				addSocketToRoom(parsedData.roomId, this);
				this.roomId = parsedData.roomId;

				const key = `room_${parsedData.roomId}`;
				const value = JSON.stringify({
					username: this.user?.username,
					socketId: this.id,
				});

				const members = await publisher.LRANGE(key, 0, -1);
				await publisher.LPUSH(key, value);
				sendJsonData(this, { type: "joined-room", members });
			} catch (error) {
				sendJsonData(this, { type: "error", error });
			}
			break;
		}
		case "leave": {
			try {
				removeSocketFromRoom(parsedData.roomId, this);
				const key = `room_${parsedData.roomId}`;
				const value = JSON.stringify({
					username: this.user?.username,
					socketId: this.id,
				});
				await publisher.LREM(key, 1, value);

				const messageData = JSON.stringify({
					type: "multicast",
					toRoomId: parsedData.roomId,
					fromSocketId: this.id,
					includeSelf: false,
					data: { type: "left-room", fromSocketId: this.id },
				});
				await publisher.publish("ws_message", messageData);
			} catch (error) {
				sendJsonData(this, { type: "error", error });
			}
			break;
		}
		case "unicast":
		case "multicast":
		case "broadcast": {
			try {
				await publisher.publish("ws_message", JSON.stringify(parsedData));
			} catch (error) {
				sendJsonData(this, { type: "error", error });
			}
			break;
		}
	}
}

// ==========================================
// connection handlers
// ==========================================
function preConnectionErrorHandler(this: WebSocket, error: Error) {
	console.log(error);
}

function postConnectionErrorHandler(this: WebSocket, error: Error) {
	console.log(error);
	this.terminate();
}

function closeHandler(this: WebSocket) {}

export const upgradeHandler = async (
	req: UpgradeIncomingMessage,
	socket: Duplex,
	head: Buffer<ArrayBuffer>,
) => {
	try {
		const access_token = req.headers["sec-websocket-protocol"] ?? "";
		socket.on("error", preConnectionErrorHandler);
		const user = await authenticate(`Bearer ${access_token}`);

		wss.handleUpgrade(req, socket, head, (wsClient) => {
			socket.removeListener("error", preConnectionErrorHandler);
			req.user = user;
			wss.emit("connection", wsClient, req);
		});
	} catch (error) {
		if (isAuthenticateError(error)) {
			switch (error.verify_type) {
				case "TOKEN_MISSING":
				case "INVALID_TOKEN":
					socket.write("HTTP/1.1 401 Unauthorized Access\r\n\r\n");
					break;
				case "FAILED_TO_VERIFY":
					socket.write("HTTP/1.1 403 Failed to verify\r\n\r\n");
			}
			socket.destroy();
		} else {
			console.log("Unknown Error", error);
		}
	}
};

wss.on("connection", (socket, req: UpgradeIncomingMessage) => {
	const socketId = generateUUID();
	socket.id = socketId;
	socket.user = req.user;
	socket.isAlive = true;
	storeConnectionMap(socketId, socket);

	socket.on("pong", heartbeat);
	socket.on("message", messageHandler);
	socket.on("error", postConnectionErrorHandler);
	socket.on("close", closeHandler);
	sendJsonData(socket, { type: "INIT", socketId });
});

wss.on("close", () => {
	clearInterval(heartbeatInterval);
});

attachMessageListener();

export { wss };
