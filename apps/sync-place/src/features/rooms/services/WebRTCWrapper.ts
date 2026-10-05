import { deepParseJson } from "common/deepParseJson";
import type { UUID } from "common/types/network";
import { WebSocketWrapper } from "../../../services/WebSocketWrapper";
import {
	getRemoteMediaStream,
	removeRemoteConnection,
	resetRemoteConnections,
	setRemoteConnection,
	setRemoteConnectionState,
} from "../store/remoteConnections";

type MemberDetails = {
	username: string;
	socketId: UUID;
};

type MessageDataObject =
	| {
			type: "joined-room";
			socketId: string;
			members: MemberDetails[];
	  }
	| {
			type: "offer" | "answer";
			sdp: RTCSessionDescriptionInit;
			fromSocketId: UUID;
	  }
	| {
			type: "ice-candidate";
			iceCandidate: RTCIceCandidateInit;
			fromSocketId: UUID;
	  }
	| {
			type: "left-room";
			fromSocketId: UUID;
	  };

function isMessageDataObject(obj: object): obj is MessageDataObject {
	return typeof obj === "object" && "type" in obj;
}

export class WebRTCWrapper extends WebSocketWrapper {
	private readonly rtc_config = {
		iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
	} as const satisfies RTCConfiguration;
	private peerConnections: Record<UUID, RTCPeerConnection>;

	// Track negotiation state flags per socket connection
	private makingOfferFlags: Record<UUID, boolean>;
	private ignoreOfferFlags: Record<UUID, boolean>;

	localStream: MediaStream;
	localAudioTrack: MediaStreamTrack | null;
	localVideoTrack: MediaStreamTrack | null;

	constructor(roomId: string) {
		super(undefined, roomId);
		this.peerConnections = {};
		this.makingOfferFlags = {};
		this.ignoreOfferFlags = {};
		this.localAudioTrack = null;
		this.localVideoTrack = null;
		this.localStream = new MediaStream();
	}

	private createPeerConnection(toSocketId: UUID) {
		const peerConnection = new RTCPeerConnection(this.rtc_config);
		this.peerConnections[toSocketId] = peerConnection;
		this.makingOfferFlags[toSocketId] = false;
		this.ignoreOfferFlags[toSocketId] = false;

		setRemoteConnection(toSocketId, peerConnection.connectionState);

		this.addTrack(toSocketId, this.localAudioTrack);
		this.addTrack(toSocketId, this.localVideoTrack);

		peerConnection.addEventListener("icecandidate", (event) => {
			if (event.candidate) {
				this.sendData({
					type: "unicast",
					fromSocketId: this.socket_id,
					toSocketId,
					data: {
						type: "ice-candidate",
						iceCandidate: event.candidate,
					},
				});
			}
		});

		peerConnection.addEventListener("connectionstatechange", (_event) => {
			setRemoteConnectionState(toSocketId, peerConnection.connectionState);
		});

		peerConnection.addEventListener("track", (event) => {
			const remoteStream = getRemoteMediaStream(toSocketId);

			remoteStream.addTrack(event.track);
		});

		peerConnection.addEventListener("negotiationneeded", async (_event) => {
			try {
				this.makingOfferFlags[toSocketId] = true;

				await peerConnection.setLocalDescription();

				this.sendData({
					type: "unicast",
					fromSocketId: this.socket_id,
					toSocketId,
					data: { type: "offer", sdp: peerConnection.localDescription },
				});
			} catch (_error) {
				console.log("Failed to renegotiate");
			} finally {
				this.makingOfferFlags[toSocketId] = false;
			}
		});
		return peerConnection;
	}

	protected async messageHandler(event: MessageEvent) {
		const data = deepParseJson(event.data) as object;
		if (!isMessageDataObject(data)) {
			return;
		}

		switch (data.type) {
			case "joined-room": {
				try {
					for (const member of data.members) {
						const peerConnection = this.createPeerConnection(member.socketId);
						const offer = await peerConnection.createOffer();
						await peerConnection.setLocalDescription(offer);
						this.sendData({
							type: "unicast",
							fromSocketId: this.socket_id,
							toSocketId: member.socketId,
							data: { type: "offer", sdp: offer },
						});
					}
				} catch (error) {
					console.log("Failed to create offers", error);
				}
				break;
			}
			case "offer": {
				try {
					if (data.sdp) {
						const fromSocketId = data.fromSocketId;
						const peerConnection = this.createPeerConnection(fromSocketId);

						const isPolitePeer = this.socket_id > fromSocketId;

						const offerCollision =
							this.makingOfferFlags[fromSocketId] ||
							peerConnection.signalingState !== "stable";

						this.ignoreOfferFlags[fromSocketId] =
							!isPolitePeer && offerCollision;

						if (this.ignoreOfferFlags[fromSocketId]) {
							console.log(
								`Impolite peer is ignore colliding offer from: ${fromSocketId}`,
							);
							return;
						}

						if (offerCollision && isPolitePeer) {
							await peerConnection.setLocalDescription({ type: "rollback" });
						}

						const remoteDescription = new RTCSessionDescription(data.sdp);
						await peerConnection.setRemoteDescription(remoteDescription);

						const answer = await peerConnection.createAnswer();
						await peerConnection.setLocalDescription(answer);

						this.sendData({
							type: "unicast",
							fromSocketId: this.socket_id,
							toSocketId: data.fromSocketId,
							data: { type: "answer", sdp: peerConnection.localDescription },
						});
					}
				} catch (error) {
					console.log("Failed to set remote offer or create answer", error);
				}
				break;
			}
			case "answer": {
				try {
					if (data.sdp) {
						const remoteDescription = new RTCSessionDescription(data.sdp);
						await this.peerConnections[data.fromSocketId].setRemoteDescription(
							remoteDescription,
						);
					}
				} catch (error) {
					console.log("Failed to set remote sdp answer", error);
				}
				break;
			}
			case "ice-candidate": {
				try {
					const peerConnection = this.peerConnections[data.fromSocketId];
					if (peerConnection && data.iceCandidate) {
						await peerConnection.addIceCandidate(data.iceCandidate);
					}
				} catch (error) {
					if (!this.ignoreOfferFlags[data.fromSocketId]) {
						console.error("Error adding received ice candidate", error);
					}
				}
				break;
			}
			case "left-room": {
				const peerConnection = this.peerConnections[data.fromSocketId];
				if (peerConnection) {
					peerConnection.close();
					delete this.peerConnections[data.fromSocketId];
					delete this.makingOfferFlags[data.fromSocketId];
					delete this.ignoreOfferFlags[data.fromSocketId];
					removeRemoteConnection(data.fromSocketId);
				}
				break;
			}
		}
	}

	protected closeHandler(event: CloseEvent) {
		if (event.code === 3333 && event.reason === "WEBSOCKET_CLOSING") {
			this.cleanUpHandler();
		}
	}

	cleanUpHandler() {
		for (const socketId in this.peerConnections) {
			this.peerConnections[socketId as UUID].close();
		}
		this.peerConnections = {};
		this.makingOfferFlags = {};
		this.ignoreOfferFlags = {};
		resetRemoteConnections();
		this.localAudioTrack?.stop();
		this.localVideoTrack?.stop();
	}

	async addTrack(socketId: UUID, track: MediaStreamTrack | null) {
		if (track) {
			const peerConnection = this.peerConnections[socketId];
			const alreadyAdded = peerConnection
				.getSenders()
				.some((sender) => sender.track?.id === track.id);
			if (!alreadyAdded) {
				peerConnection.addTrack(track);
			}
		}
	}

	async addTrackToAll(audioTrack: MediaStreamTrack | null) {
		for (const socketId in this.peerConnections) {
			await this.addTrack(socketId as UUID, audioTrack);
		}
	}

	async toggleAudio(audio: boolean) {
		if (audio) {
			if (this.localAudioTrack === null) {
				try {
					const audioStream = await navigator.mediaDevices.getUserMedia({
						audio,
					});
					this.localAudioTrack = audioStream.getTracks()[0];
					this.localStream.addTrack(this.localAudioTrack);
					this.addTrackToAll(this.localAudioTrack);
				} catch (_error) {
					console.log("Capturing Audio Failed");
				}
			} else {
				this.localAudioTrack.enabled = true;
			}
		} else {
			if (this.localAudioTrack) {
				this.localAudioTrack.enabled = false;
			}
		}
	}

	async toggleVideo(video: boolean) {
		if (video) {
			if (this.localVideoTrack === null) {
				try {
					const videoStream = await navigator.mediaDevices.getUserMedia({
						video,
					});
					this.localVideoTrack = videoStream.getTracks()[0];
					this.localStream.addTrack(this.localVideoTrack);
					this.addTrackToAll(this.localVideoTrack);
				} catch (_error) {
					console.log("Capturing Video Failed");
				}
			} else {
				this.localVideoTrack.enabled = true;
			}
		} else {
			if (this.localVideoTrack) {
				this.localVideoTrack.enabled = false;
			}
		}
	}

	async toggleLocalStream(audio: boolean, video: boolean) {
		await this.toggleAudio(audio);
		await this.toggleVideo(video);
		return this.localStream;
	}
}
