import type { UUID } from "common/types/network";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ConnectionData = {
	state: RTCPeerConnectionState;
	stream: MediaStream;
};

type RemoteConnectionsStore = {
	connections: Record<UUID, ConnectionData>;
};

const initialData = {
	connections: {},
} satisfies RemoteConnectionsStore;

export const useRemoteConnectionsStore = create<RemoteConnectionsStore>()(
	devtools(
		immer(() => ({
			...initialData,
		})),
	),
);

export const getRemoteMediaStream = (id: UUID) => {
	return useRemoteConnectionsStore.getState().connections[id].stream;
};

export const setRemoteConnection = (
	id: UUID,
	state: RTCPeerConnectionState,
) => {
	useRemoteConnectionsStore.setState((s) => ({
		connections: {
			...s.connections,
			[id]: { state, stream: new MediaStream() },
		},
	}));
};

export const setRemoteStream = (id: UUID, stream: MediaStream) => {
	useRemoteConnectionsStore.setState((s) => {
		s.connections[id].stream = stream;
	});
};

export const setRemoteConnectionState = (
	id: UUID,
	state: RTCPeerConnectionState,
) => {
	useRemoteConnectionsStore.setState((s) => {
		s.connections[id].state = state;
	});
};

export const removeRemoteConnection = (id: UUID) => {
	useRemoteConnectionsStore.setState((s) => {
		delete s.connections[id];
	});
};

export const resetRemoteConnections = () => {
	useRemoteConnectionsStore.setState({ ...initialData });
};
