import express, { type Router } from "express";
import {
	httpTokenRefresh,
	httpUserCreation,
	httpUserLogin,
	httpUserLogout,
} from "./authentication.controller.ts";

const authenticationRouter: Router = express.Router();

authenticationRouter.post("/login", httpUserLogin);
authenticationRouter.post("/register", httpUserCreation);
authenticationRouter.post("/refresh", httpTokenRefresh);
authenticationRouter.post("/logout", httpUserLogout);

export { authenticationRouter };
