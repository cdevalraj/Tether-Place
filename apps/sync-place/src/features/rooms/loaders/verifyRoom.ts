import { redirect } from "@tanstack/react-router";
import { roomService } from "../services/roomService";

export const verifyRoom = async (roomId: string) => {
	try {
		const success = await roomService.verify(roomId);
		if (success) return;
	} catch (error) {
		console.log(error);
	}
	throw redirect({ to: "/rooms" });
};
