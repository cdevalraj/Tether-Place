import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../../config.ts";
import { publisher } from "../../connections/redis.ts";
import { UserModel } from "../../models/User.ts";

const ACCESS_TOKEN_SECRET = config.access_token_secret;
const REFRESH_TOKEN_SECRET = config.refresh_token_secret;

export const httpUserCreation: RequestHandler = async (req, res) => {
	try {
		const foundUser = await UserModel.findOne({ email: req.body.email });
		if (foundUser) {
			return res.status(409).send({ message: "User Already Exists" });
		}

		const email = req.body.email;
		const username = email.substring(0, email.indexOf("@"));
		const hashedPwd = await bcrypt.hash(req.body.password, 10);

		const newUser = new UserModel({
			email,
			username,
			password: hashedPwd,
			name: req.body.name,
			birthdate: req.body.birthdate,
		});
		newUser
			.save()
			.then(() => {
				res.status(201).send({
					success: true,
					message: "User has been Registered Successfully",
				});
			})
			.catch((error) => {
				res.status(424).send({ message: error });
			});
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpUserLogin: RequestHandler = async (req, res) => {
	try {
		const userIdentifier: string = req.body.userIdentifier ?? "";
		const foundUser = await UserModel.findOne({
			$or: [{ email: userIdentifier }, { username: userIdentifier }],
		});
		if (!foundUser) {
			return res.status(400).send({ message: "Invalid" });
		}

		const passwordMatched = await bcrypt.compare(
			req.body.password,
			foundUser.password,
		);
		if (passwordMatched) {
			const user = {
				username: foundUser.username,
				email: foundUser.email,
				role: foundUser.role,
			};
			const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
				expiresIn: "15m",
			});
			const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {
				expiresIn: "5d",
			});
			publisher.lPush("refresh_token", refreshToken);
			res
				.cookie("syncplace_refreshtoken", refreshToken, {
					secure: false,
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					maxAge: 5 * 24 * 60 * 60 * 1000,
				})
				.send({ accessToken, user });
		} else {
			res.status(401).send({ message: "Username or Email/Password Invalid" });
		}
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpTokenRefresh: RequestHandler = async (req, res) => {
	const notFoundReponse = () => {
		res.status(404).send({ message: "Refresh Token Missing" });
	};
	const cookies = req.cookies;
	const refreshToken: string = cookies.syncplace_refreshtoken;

	if (!refreshToken) {
		return notFoundReponse();
	}

	try {
		const refreshTokens = await publisher.lRange("refresh_token", 0, -1);
		if (!refreshTokens.includes(refreshToken)) {
			return notFoundReponse();
		}
		jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (errors, decoded) => {
			if (errors || typeof decoded !== "object") {
				return notFoundReponse();
			}
			const user = {
				username: decoded.username,
				email: decoded.email,
				role: decoded.role,
			};
			const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
				expiresIn: "15m",
			});
			res.send({ accessToken, user });
		});
	} catch (error) {
		res.status(403).send({ message: error });
	}
};

export const httpUserLogout: RequestHandler = async (req, res) => {
	try {
		const refreshToken = req.cookies.syncplace_refreshtoken ?? "";
		await publisher.lRem("refresh_token", 1, refreshToken);
		res
			.clearCookie("syncplace_refreshtoken", {
				secure: true,
				httpOnly: true,
				sameSite: "none",
			})
			.status(200)
			.send({ message: "Logged Out Successfully" });
	} catch (error) {
		res.status(424).send({ message: error });
	}
};
