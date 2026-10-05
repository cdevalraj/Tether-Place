import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config.ts";
import type { RequestUser } from "../types/network.ts";

export interface IAuthenticateError {
	verify_type: "TOKEN_MISSING" | "INVALID_TOKEN" | "FAILED_TO_VERIFY";
}

export function isAuthenticateError(
	error: unknown,
): error is IAuthenticateError {
	return !!error && typeof error === "object" && "verify_type" in error;
}

export const authenticate = (authTokenValue: unknown) => {
	return new Promise<RequestUser>((resolve, reject) => {
		if (!authTokenValue || typeof authTokenValue !== "string") {
			reject({ verify_type: "TOKEN_MISSING" });
			return;
		}
		const token = authTokenValue.split(" ")[1];
		if (!token) {
			reject({ verify_type: "TOKEN_MISSING" });
			return;
		}

		jwt.verify(token, config.access_token_secret, (errors, decodedUser) => {
			if (errors || !decodedUser || typeof decodedUser !== "object") {
				if (errors) {
					reject({ verify_type: "FAILED_TO_VERIFY" });
				} else {
					reject({ verify_type: "INVALID_TOKEN" });
				}
				return;
			}
			resolve(decodedUser as RequestUser);
		});
	});
};

export const authenticateRequest: RequestHandler = async (req, res, next) => {
	try {
		const user = await authenticate(req.headers.authorization);
		req.user = user;
		if (next) {
			next();
		}
	} catch (error: unknown) {
		if (isAuthenticateError(error)) {
			switch (error.verify_type) {
				case "TOKEN_MISSING":
				case "INVALID_TOKEN":
					res.status(401).json({ message: "Unauthorized Access" });
					break;
				case "FAILED_TO_VERIFY":
					res.sendStatus(403);
			}
		} else {
			console.log("Unknown Error");
		}
	}
};
