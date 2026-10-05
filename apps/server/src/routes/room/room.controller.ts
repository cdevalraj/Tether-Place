import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { publisher } from "../../connections/redis.ts";
import { assertAuthenticated } from "../../types/network.ts";

// TODO: handle room id removal
export const httpCreateRoom: RequestHandler = async (req, res) => {
	assertAuthenticated(req);
	try {
		const roomId = crypto.randomBytes(64).toString("hex").slice(0, 16);
		await publisher.LPUSH("roomIds", roomId);
		res.status(201).send({ roomId });
	} catch (error) {
		res.send(500).send({ message: "Failed to create a room", error });
	}
};

export const httpGetRoomDetails: RequestHandler = async (req, res) => {
	assertAuthenticated(req);
	try {
		const roomIds: string[] = await publisher.LRANGE("roomIds", 0, -1);
		const roomId = req.params.id as string;
		if (roomId && roomIds.includes(roomId)) {
			return res.status(200).send({
				exists: true,
				// name: "My Meeting",
				// participantCount: 2,
			});
		}
		res.sendStatus(404);
	} catch (error) {
		res.send(500).send({ message: "Failed to verify", error });
	}
};
