import { useNavigate } from "@tanstack/react-router";
import FormSubmitButton from "../../../components/FormSubmitButton";
import { JoinRoomDetails } from "../../../schema/Room";
import { roomService } from "../services/roomService";

const JoinForm = () => {
	const navigation = useNavigate();

	const roomJoinAction = async (formData: FormData) => {
		const data = Object.fromEntries(formData.entries());
		const parsedData = JoinRoomDetails.safeParse(data);
		if (parsedData.success) {
			try {
				const success = await roomService.verify(parsedData.data.roomId);
				if (success) {
					navigation({
						to: "/rooms/$roomId",
						params: { roomId: parsedData.data.roomId },
					});
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	return (
		<form action={roomJoinAction} className="room-join-form">
			<div className="input-field">
				<label htmlFor="roomId">Room Id</label>
				<input
					type="text"
					placeholder="Room Id"
					id="roomId"
					name="roomId"
					required
				/>
			</div>
			<FormSubmitButton waitingText="Joining..." actionText="Join" />
		</form>
	);
};
export default JoinForm;
