import mongoose from "mongoose";

export interface Note {
	createdBy: string;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

const NoteSchema = new mongoose.Schema(
	{
		createdBy: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			immutable: true,
			default: () => Date.now(),
		},
		updatedAt: {
			type: Date,
			default: () => Date.now(),
		},
	},
	{ collection: "notes" },
);

export const NoteModel = mongoose.model("note", NoteSchema);
