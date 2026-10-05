import type { AxiosError } from "axios";
import { server } from "../../../lib/axios";
import type {
	LoginDetails,
	RegisterationDetails,
	User,
} from "../../../schema/User";
import { resetStore, setAccessToken, setUser } from "../../../store/auth";

type LoginResponse = {
	user: User;
	accessToken: string;
};

type LogoutResponse = {
	message: string;
};

type RegisterationResponse = {
	success: boolean;
};

class AuthenticationService {
	readonly regex = {
		name: "^[A-Za-z ]{4,70}$",
		email: "[a-z0-9._]+@[a-z0-9]+.[a-z]{2,}",
		password:
			"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,24}$",
	} as const;

	login(userData: LoginDetails) {
		return new Promise<boolean>((resolve, reject) => {
			server
				.post<LoginResponse>("/auth/login", userData)
				.then((res) => {
					if (res.data?.accessToken) {
						// save user data
						setAccessToken(res.data.accessToken);
						setUser(res.data.user);
						resolve(true);
						return;
					}
					resolve(false);
				})
				.catch((error: AxiosError) => {
					if (error.status === 401) {
						resolve(false);
						return;
					}
					reject(error);
				});
		});
	}

	logout() {
		return new Promise<boolean>((resolve, reject) => {
			server
				.post<LogoutResponse>("/auth/logout", {})
				.then((res) => {
					if (res.status === 200) {
						resetStore();
						resolve(true);
					}
					resolve(false);
				})
				.catch((error: AxiosError) => {
					if (error.status === 424) {
						resolve(false);
					}
					reject(false);
				});
		});
	}

	register(userData: RegisterationDetails) {
		return new Promise<boolean>((resolve, reject) => {
			server
				.post<RegisterationResponse>("/auth/register", userData)
				.then((res) => {
					if (res.data?.success) {
						resolve(true);
						return;
					}
					resolve(false);
				})
				.catch((error: AxiosError) => {
					if (error.status === 409) {
						// user already exists
						resolve(false);
						return;
					}
					if (error.status === 424) {
						// please try to create an account after some time
						resolve(false);
						return;
					}
					reject(error);
				});
		});
	}
}

export const authService = new AuthenticationService();
