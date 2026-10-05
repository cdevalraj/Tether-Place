import type { AxiosError } from "axios";
import { server } from "../../../lib/axios";

interface GetResponse {
	exists: boolean;
}

interface CreateResponse {
	roomId: string;
}

class RoomService {
	create() {
		return new Promise<string>((resolve, reject) => {
			server
				.post<CreateResponse>("/room/create", {})
				.then((res) => {
					if (res.data.roomId) {
						resolve(res.data.roomId);
						return;
					}
					reject({ message: "Failed to create a room" });
				})
				.catch((error) => reject(error));
		});
	}

	verify(roomId: string) {
		return new Promise<boolean>((resolve, reject) => {
			server
				.get<GetResponse>(`/room/${roomId}`)
				.then((res) => {
					if (res.status === 200 && res.data.exists) {
						resolve(true);
						return;
					}
					resolve(false);
				})
				.catch((error: AxiosError) => {
					if (error.status === 404) {
						resolve(false);
						return;
					}
					reject(error);
				});
		});
	}
}

export const roomService = new RoomService();
