import z from "zod";

export const JoinRoomDetails = z.object({
	roomId: z.string(),
});

export type JoinRoomDetails = z.infer<typeof JoinRoomDetails>;
