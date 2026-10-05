import { useState } from "react";
import CreateButton from "../../features/rooms/components/CreateButton";
import JoinForm from "../../features/rooms/components/JoinForm";

type Tabs = "join" | "create";

const RoomsLobby = () => {
	const [tab, setTab] = useState<Tabs>("join");

	return (
		<div className="main-content rooms-lobby">
			<h1>Lobby</h1>
			<div className="tab-layout">
				<div className="tab-btns">
					<button
						type="button"
						className="btn tab-btn"
						onClick={() => setTab("join")}
					>
						Join
					</button>
					<button
						type="button"
						className="btn tab-btn"
						onClick={() => setTab("create")}
					>
						Create
					</button>
				</div>
				<div className="tab-content">
					{tab === "join" ? <JoinForm /> : <CreateButton />}
				</div>
			</div>
		</div>
	);
};

export default RoomsLobby;
