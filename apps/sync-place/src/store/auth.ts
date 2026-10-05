import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "../schema/User";

type AuthStore = {
	accessToken: string;
	user: User;
};

const initialData = {
	accessToken: "",
	user: {
		name: "",
		email: "",
		birthdate: new Date(),
	},
} satisfies AuthStore;

export const useAuthStore = create<AuthStore>()(
	devtools(immer(() => ({ ...initialData }))),
);

export const getAccessToken = () => {
	return useAuthStore.getState().accessToken;
};

export const resetStore = () => {
	useAuthStore.setState({ ...initialData });
};

export const setAccessToken = (accessToken?: string) => {
	if (accessToken) {
		useAuthStore.setState(() => ({ accessToken }));
	}
};

export const setUser = (user?: User) => {
	if (user) {
		useAuthStore.setState(() => ({ user }));
	}
};

export const setUserName = (name?: string) => {
	if (name) {
		useAuthStore.setState((s) => {
			s.user.name = name;
		});
	}
};

export const setUserBirthdate = (birthdate?: string) => {
	if (birthdate) {
		useAuthStore.setState((s) => {
			s.user.birthdate = new Date(birthdate);
		});
	}
};
