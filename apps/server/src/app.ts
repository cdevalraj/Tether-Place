import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { authenticationRouter } from "./routes/authentication/authentication.router.ts";
import { invalidUrlHandler } from "./routes/invalid-url.ts";
import { noteRouter } from "./routes/note/note.router.ts";
import { roomRouter } from "./routes/room/room.router.ts";

const app: Express = express();

app.set("json spaces", 2);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// TODO: add logging

app.use("/auth", authenticationRouter);

app.use("/note", noteRouter);

app.use("/room", roomRouter);

app.use(invalidUrlHandler);

export default app;
