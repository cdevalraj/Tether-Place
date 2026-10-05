export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type SocketSubscription = {
	type: "join" | "leave";
	roomId: string;
};

export type SocketCasting = {
	fromSocketId: UUID;
	includeSelf?: boolean;
	data: object;
};

export type SocketUnicast = SocketCasting & {
	type: "unicast";
	toSocketId: UUID;
};

export type SocketMulticast = SocketCasting & {
	type: "multicast";
	toRoomId: string;
};

export type SocketBroadcast = SocketCasting & {
	type: "broadcast";
};

export type SocketData =
	| SocketSubscription
	| SocketUnicast
	| SocketMulticast
	| SocketBroadcast;

export function isSocketData(data: unknown): data is SocketData {
	return !!data && typeof data === "object" && "type" in data;
}
