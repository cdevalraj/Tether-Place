import { noteService } from "../services/noteService";

interface NoteDataLoader {
	params: { noteId: string };
}

export const noteDataLoader = async ({ params }: NoteDataLoader) => {
	if (params.noteId !== "NEW") {
		try {
			return { note: await noteService.get(params.noteId) };
		} catch (error) {
			console.log(error);
		}
	}
	return {};
};
