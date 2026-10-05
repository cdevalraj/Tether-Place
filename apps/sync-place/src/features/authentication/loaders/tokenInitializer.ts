import { refreshToken } from "../../../lib/axios";

let initialLoad = true;

export const tokenInitializer = async () => {
	if (initialLoad) {
		await refreshToken().catch((_error) => {});
		initialLoad = false;
	}
};
