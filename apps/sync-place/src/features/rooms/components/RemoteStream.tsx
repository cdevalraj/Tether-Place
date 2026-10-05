import type { UUID } from "common/types/network";
import { useEffect, useRef } from "react";

interface RemoteStreamProps {
	remoteId: UUID;
	state: RTCPeerConnectionState;
	stream: MediaStream;
}

const RemoteStream = ({ state, stream }: RemoteStreamProps) => {
	const remoteStreamRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (remoteStreamRef.current) {
			remoteStreamRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<div className="remote-stream">
			<h6>{state}</h6>
			{/** biome-ignore lint/a11y/useMediaCaption: <Used_For_Camera_Feed> */}
			<video ref={remoteStreamRef} controls={false} autoPlay playsInline />
		</div>
	);
};

export default RemoteStream;
