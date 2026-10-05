/** biome-ignore-all lint/a11y/useMediaCaption: <Used_For_Camera_Feed> */
import { useNavigate, useParams } from "@tanstack/react-router";
import type { UUID } from "common/types/network";
import { type MouseEventHandler, useEffect, useRef, useState } from "react";
import ToggleSwitch from "../../components/ToggleSwitch";
import RemoteStream from "../../features/rooms/components/RemoteStream";
import { WebRTCWrapper } from "../../features/rooms/services/WebRTCWrapper";
import { useRemoteConnectionsStore } from "../../features/rooms/store/remoteConnections";
import { usePageCleanUp } from "../../hooks/usePageCleanUp";

type ClickHandler = MouseEventHandler<HTMLButtonElement>;

const Room = () => {
	const [joined, setJoined] = useState(false);
	const [video, setVideo] = useState(false);
	const [audio, setAudio] = useState(false);
	const navigation = useNavigate();
	const { roomId } = useParams({ from: "/rooms/$roomId" });
	const remoteConnections = useRemoteConnectionsStore((s) => s.connections);

	const localStreamRef = useRef<HTMLVideoElement>(null);
	const localStreamPreviewRef = useRef<HTMLVideoElement>(null);
	// const screenStreamRef = useRef<HTMLVideoElement>(null);

	const webRTCRef = useRef(new WebRTCWrapper(roomId));

	const joinHandler: ClickHandler = (event) => {
		event.preventDefault();
		webRTCRef.current.connect();
		setJoined(true);
	};

	const cancelHandler: ClickHandler = (event) => {
		event.preventDefault();
		navigation({ to: "/rooms" });
	};

	useEffect(() => {
		const setSrcObject = async () => {
			try {
				const stream = await webRTCRef.current.toggleLocalStream(audio, video);
				if (localStreamRef.current?.srcObject === null) {
					localStreamRef.current.srcObject = stream;
				}
				if (localStreamPreviewRef.current?.srcObject === null) {
					localStreamPreviewRef.current.srcObject = stream;
				}
			} catch (_error) {
				console.log("Failed to set local stream");
			}
		};
		setSrcObject();
	}, [video, audio]);

	usePageCleanUp(() => {
		webRTCRef.current.disconnect();
		webRTCRef.current.cleanUpHandler();
	});

	return (
		<div className="main-content room">
			<div
				style={{ display: joined ? undefined : "none" }}
				className="main-room-view"
			>
				<div className="streams">
					<div className="remote-streams">
						{Object.keys(remoteConnections).map((remoteId) => (
							<RemoteStream
								key={remoteId}
								remoteId={remoteId as UUID}
								{...remoteConnections[remoteId as UUID]}
							/>
						))}
					</div>
					{/* <div className="screen-stream">
						<video
							ref={screenStreamRef}
							controls={false}
							autoPlay
							playsInline
						/>
					</div> */}
					<div className="local-stream">
						<video
							ref={localStreamRef}
							controls={false}
							autoPlay
							playsInline
							muted
						/>
					</div>
				</div>
				<div className="local-stream-toggles">
					<div className="local-stream-toggle">
						<label htmlFor="video-toggle">Video</label>
						<ToggleSwitch
							id="video-toggle"
							checked={video}
							onToggleChange={() => setVideo((p) => !p)}
						/>
					</div>
					<div className="local-stream-toggle">
						<label htmlFor="audio-toggle">Audio</label>
						<ToggleSwitch
							id="audio-toggle"
							checked={audio}
							onToggleChange={() => setAudio((p) => !p)}
						/>
					</div>
					<button type="button" className="btn leave" onClick={cancelHandler}>
						leave
					</button>
				</div>
			</div>
			{!joined && (
				<div className="join-popup">
					<div className="popup-container">
						<div className="preview">
							<video
								ref={localStreamPreviewRef}
								controls={false}
								autoPlay
								playsInline
								muted
							/>
							<div className="preview-toggles">
								<div className="preview-toggle">
									<label htmlFor="video-preview-toggle">Video</label>
									<ToggleSwitch
										id="video-preview-toggle"
										checked={video}
										onToggleChange={() => setVideo((p) => !p)}
									/>
								</div>
								<div className="preview-toggle">
									<label htmlFor="audio-preview-toggle">Audio</label>
									<ToggleSwitch
										id="audio-preview-toggle"
										checked={audio}
										onToggleChange={() => setAudio((p) => !p)}
									/>
								</div>
							</div>
						</div>
						<div className="join-room-actions">
							<button type="button" className="btn" onClick={cancelHandler}>
								cancel
							</button>
							<button type="button" className="btn" onClick={joinHandler}>
								join
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Room;
