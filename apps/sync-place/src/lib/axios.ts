import axios, {
	type AxiosError,
	type AxiosRequestConfig,
	type InternalAxiosRequestConfig,
} from "axios";
import { config } from "../config";
import { setAccessToken, useAuthStore } from "../store/auth";

interface RefreshResponse {
	accessToken: string;
}

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024;

const instance = axios.create({
	baseURL: config.server_url,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});
instance.defaults.maxContentLength = MAX_CONTENT_LENGTH;
instance.defaults.maxBodyLength = MAX_CONTENT_LENGTH;

export const refreshToken = () => {
	return new Promise<string>((resolve, reject) => {
		const accessToken = useAuthStore.getState().accessToken;
		if (accessToken) {
			resolve(accessToken);
			return;
		}

		instance
			.post<RefreshResponse>("/auth/refresh")
			.then((res) => {
				if (res.data?.accessToken) {
					const { accessToken } = res.data;
					setAccessToken(accessToken);
					resolve(accessToken);
					return;
				}
				resolve("");
			})
			.catch((error: AxiosError) => {
				if (error?.status === 401 || error?.status === 404) {
					resolve("");
					return;
				}
				reject(error);
			});
	});
};

// Track state for the refresh cycle
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

// Helper to process the queued requests once a new token is fetched
const processQueue = (error: unknown, token?: string) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else if (token) {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

instance.interceptors.request.use((config) => {
	const accessToken = useAuthStore.getState().accessToken;
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	return config;
});

instance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};
		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = `Bearer ${token}`;
							}
							resolve(instance(originalRequest));
						},
						reject: (err) => reject(err),
					});
				});
			}
			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const accessToken = await refreshToken();
				if (accessToken !== "") {
					setAccessToken(accessToken);
					if (originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${accessToken}`;
					}

					processQueue(null, accessToken);
					return instance(originalRequest);
				}
			} catch (refreshError) {
				processQueue(refreshError);
				await instance.post("/auth/logout");
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject<AxiosError>(error);
	},
);

export const server = {
	get: <T>(url: string, config?: AxiosRequestConfig<string, string>) =>
		instance.get<T>(url, config),
	post: <T>(
		url: string,
		data: object,
		config?: AxiosRequestConfig<unknown, string>,
	) => instance.post<T>(url, data, config),
	delete: <T>(url: string, config?: AxiosRequestConfig<string, string>) =>
		instance.delete<T>(url, config),
	put: <T>(
		url: string,
		data: object,
		config?: AxiosRequestConfig<unknown, string>,
	) => instance.put<T>(url, data, config),
} as const;
