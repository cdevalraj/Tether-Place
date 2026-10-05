import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth";

export const requireAuth = () => {
	const { accessToken } = useAuthStore.getState();
	if (!accessToken) {
		throw redirect({ to: "/auth/login" });
	}
};

export const requireAnonymous = () => {
	const { accessToken } = useAuthStore.getState();
	if (accessToken) {
		throw redirect({ to: "/" });
	}
};
