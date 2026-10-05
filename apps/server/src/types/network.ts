import type { Request } from "express";

export interface RequestUser {
	username: string;
	email: string;
	role: string;
}

export function assertAuthenticated(
	req: Request,
): asserts req is Request & { user: RequestUser } {
	if (!req.user) {
		throw new Error(
			"Internal Server Error: Route requires authentication middleware",
		);
	}
}
