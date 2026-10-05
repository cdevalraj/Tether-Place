import express, { type Router } from "express";
import { authenticateRequest } from "../../middleware/token-authentication.ts";
import {
	httpCreateNote,
	httpGetNote,
	httpGetNotes,
	httpRemoveNote,
	httpUpdateNote,
} from "./note.controller.ts";

const noteRouter: Router = express.Router();

noteRouter.get("/", authenticateRequest, httpGetNotes);
noteRouter.post("/", authenticateRequest, httpCreateNote);
noteRouter.get("/:id", authenticateRequest, httpGetNote);
noteRouter.put("/:id", authenticateRequest, httpUpdateNote);
noteRouter.delete("/:id", authenticateRequest, httpRemoveNote);

export { noteRouter };
