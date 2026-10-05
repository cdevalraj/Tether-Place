import express, { type Router } from "express";
import { authenticateRequest } from "../../middleware/token-authentication.ts";
import { httpCreateRoom, httpGetRoomDetails } from "./room.controller.ts";

const roomRouter: Router = express.Router();

roomRouter.get("/:id", authenticateRequest, httpGetRoomDetails);
roomRouter.post("/create", authenticateRequest, httpCreateRoom);

export { roomRouter };
