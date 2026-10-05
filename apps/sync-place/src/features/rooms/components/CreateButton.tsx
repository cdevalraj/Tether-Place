import { useNavigate } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";
import { roomService } from "../services/roomService";

type CreateRoomHandler = MouseEventHandler<HTMLButtonElement>;

const CreateButton = () => {
	const navigation = useNavigate();

	const createRoomHandler: CreateRoomHandler = async (event) => {
		event.preventDefault();
		try {
			const roomId = await roomService.create();
			navigation({ to: "/rooms/$roomId", params: { roomId } });
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<button
			type="button"
			onClick={createRoomHandler}
			className="btn room-create"
		>
			Create New
		</button>
	);
};

export default CreateButton;
