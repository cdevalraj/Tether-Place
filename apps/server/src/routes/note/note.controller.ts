import type { RequestHandler } from "express";
import type { ObjectId } from "mongoose";
import { publisher, setEx } from "../../connections/redis.ts";
import { type Note, NoteModel } from "../../models/Note.ts";
import { assertAuthenticated, type RequestUser } from "../../types/network.ts";

type RecordFetchType = "one" | "many";

interface Page {
	index: number;
	size: number;
}

interface INoteCacheKeyOptions {
	id?: ObjectId;
	page?: Page;
	user: RequestUser;
}

type IGetNoteOptions =
	| {
			id?: ObjectId;
			type: "one";
			user: RequestUser;
	  }
	| {
			id?: ObjectId;
			type: "many";
			page: Page;
			user: RequestUser;
	  };

type GetReturnType<T> = T extends "one" ? Note : Note[];

const generateCacheKey = (options: INoteCacheKeyOptions) => {
	const { id, user } = options;
	const params: string[] = [];
	if (user?.username) {
		params.push(`user=${user.username}`);
	}
	if (id) {
		params.push(`id=${id}`);
	}
	// if (page) {
	// 	params.push(`pageIndex=${page.index}&pageSize=${page.size}`);
	// }
	return `notes?${params.join("&")}`;
};

async function getNoteOrCache<T extends RecordFetchType>(
	options: IGetNoteOptions,
): Promise<GetReturnType<T>> {
	const { id, type, user } = options;
	const cacheKey = generateCacheKey(options);
	try {
		const cachedNoteStr = await publisher.get(cacheKey);
		if (cachedNoteStr != null) {
			return JSON.parse(cachedNoteStr);
		}
		switch (type) {
			case "one": {
				const note = (await NoteModel.findById(id)) as Note;
				await setEx(cacheKey, JSON.stringify(note));
				return note as GetReturnType<T>;
			}
			case "many": {
				const { page } = options;
				const notes = (await NoteModel.find({ createdBy: user.username })
					.skip(page.index * page.size)
					.limit(page.size)) as Note[];
				await setEx(cacheKey, JSON.stringify(notes));
				return notes as GetReturnType<T>;
			}
		}
	} catch (error) {
		console.log(error);
	}
	return (type === "one" ? ({} as Note) : ([] as Note[])) as GetReturnType<T>;
}

const resetCache = async (keyOptions: INoteCacheKeyOptions) => {
	// TODO: handle deletion of paginated results
	const allCacheKey = generateCacheKey({ user: keyOptions.user });
	await publisher.del(allCacheKey);
	if (keyOptions.id) {
		const oneCacheKey = generateCacheKey(keyOptions);
		await publisher.del(oneCacheKey);
	}
};

export const httpGetNotes: RequestHandler = async (req, res) => {
	try {
		assertAuthenticated(req);
		const queryParams = req.query as unknown as {
			pageIndex: string;
			pageSize: string;
		};
		const pageIndex = parseInt(queryParams.pageIndex ?? "0", 10);
		const pageSize = parseInt(queryParams.pageSize ?? "25", 10);

		const notes = await getNoteOrCache<"many">({
			type: "many",
			user: req.user,
			page: {
				index: pageIndex,
				size: pageSize,
			},
		});
		res.send(notes);
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpGetNote: RequestHandler = async (req, res) => {
	try {
		assertAuthenticated(req);
		const noteId = req.params.id as unknown as ObjectId;
		const note = await getNoteOrCache<"one">({
			type: "one",
			id: noteId,
			user: req.user,
		});
		res.send(note);
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpCreateNote: RequestHandler = async (req, res) => {
	try {
		assertAuthenticated(req);
		const note = new NoteModel({
			title: req.body.title,
			createdBy: req.user.username,
			content: req.body.content,
		});
		const savedNote = await note.save();
		await resetCache({ user: req.user });

		res.status(201).send({ note: savedNote });
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpRemoveNote: RequestHandler = async (req, res) => {
	try {
		assertAuthenticated(req);
		const noteId = req.params.id as unknown as ObjectId;
		await NoteModel.deleteOne({ _id: noteId });
		await resetCache({ id: noteId, user: req.user });
		res.send({ success: true, message: "Note deleted Successfully" });
	} catch (error) {
		res.status(500).send({ message: error });
	}
};

export const httpUpdateNote: RequestHandler = async (req, res) => {
	try {
		assertAuthenticated(req);
		const noteId = req.params.id as unknown as ObjectId;
		const updatedNote = await NoteModel.findOneAndUpdate(
			{ _id: noteId },
			{
				$set: {
					title: req.body.title,
					content: req.body.content,
					updatedAt: new Date(),
				},
			},
			{ new: true },
		);
		await resetCache({ id: noteId, user: req.user });
		res.send({ note: updatedNote });
	} catch (error) {
		res.status(500).send({ message: error });
	}
};
