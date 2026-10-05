import { type GetAllOptions, noteService } from "../services/noteService";

export const notesDataLoader = async (options?: GetAllOptions) => {
	try {
		return { notes: await noteService.getAll(options) };
	} catch (error) {
		console.log(error);
	}
	return { notes: [] };
};
