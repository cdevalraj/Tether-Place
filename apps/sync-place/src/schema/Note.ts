import * as z from "zod";

export const NoteSchema = z.object({
	_id: z.string(),
	title: z.string(),
	content: z.string(),
	createdBy: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const NoteFormSchema = z.object({
	_id: z.string().optional(),
	title: z.string(),
	content: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteFormDetails = z.infer<typeof NoteFormSchema>;
