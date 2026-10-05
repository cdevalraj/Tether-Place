import type { RequestUser } from "./network.ts";

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}
