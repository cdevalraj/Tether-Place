// biome-ignore lint/correctness/noUnusedImports: <EXTENDED_TYPE>
import * as ws from "ws";
import type { RequestUser, UUID } from "./network.ts";

declare module "ws" {
	interface WebSocket {
		id?: UUID;
		roomId?: string;
		isAlive?: boolean;
		user?: RequestUser;
	}
}
