import type { SocketData, UUID } from "common/types/network";
import { config } from "../config";
import { getAccessToken } from "../store/auth";

type SocketInitData = { type: "INIT"; socketId: UUID };

function isSocketInitData(obj: object): obj is SocketInitData {
	return typeof obj === "object" && "type" in obj && obj.type === "INIT";
}

export type Void = Promise<void> | void;

export abstract class WebSocketWrapper {
	private readonly server_url: string;
	protected readonly room_id: string;
	protected socket_id: UUID;

	private socket?: WebSocket;

	constructor(roomId?: string) {
		this.server_url = config.ws_server_url;
		this.room_id = roomId ?? "NO_ROOM_ID";
		this.socket_id = crypto.randomUUID();
	}

	private socketIdInitilizer(event: MessageEvent) {
		if (typeof event.data !== "string") {
			return;
		}
		const data = JSON.parse(event.data);
		if (!isSocketInitData(data)) {
			return;
		}

		this.socket_id = data.socketId;
		this.socket?.removeEventListener("message", this.socketIdInitilizer);
	}

	connect() {
		if (
			this.socket &&
			(this.socket.readyState === WebSocket.OPEN ||
				this.socket.readyState === WebSocket.CONNECTING)
		) {
			return;
		}

		const socket = new WebSocket(this.server_url, getAccessToken());
		this.socket = socket;

		socket.addEventListener("message", (event) =>
			this.socketIdInitilizer(event),
		);
		socket.addEventListener("message", (event) => this.messageHandler(event));
		socket.addEventListener("close", (event) => this.closeHandler(event));
		socket.addEventListener("error", console.error);

		if (this.room_id !== "NO_ROOM_ID") {
			this.sendDataWhenReady({ type: "join", roomId: this.room_id });
		}
	}

	disconnect() {
		if (this.socket?.readyState === WebSocket.OPEN) {
			if (this.room_id !== "NO_ROOM_ID") {
				this.sendData({ type: "leave", roomId: this.room_id });
			}
			this.socket?.close(3333, "WEBSOCKET_CLOSING");
		}
	}

	sendData(data: SocketData) {
		if (
			!this.socket ||
			this.socket.readyState !== WebSocket.OPEN ||
			typeof data !== "object"
		) {
			return;
		}

		this.socket.send(JSON.stringify(data));
	}

	sendDataWhenReady(data: SocketData) {
		const socket = this.socket;
		if (!socket || typeof data !== "object") {
			return;
		}

		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(data));
		} else {
			socket.addEventListener("open", () => socket.send(JSON.stringify(data)), {
				once: true,
			});
		}
	}

	protected abstract messageHandler(event: MessageEvent): Void;
	protected abstract closeHandler(event: CloseEvent): Void;
}
