import { server } from "../../../lib/axios";
import type { Note, NoteFormDetails } from "../../../schema/Note";

interface SaveResponse {
	note: Note;
}

interface DeleteResponse {
	success: boolean;
	message: string;
}

export interface GetAllOptions {
	pageSize?: number;
	pageIndex?: number;
}

const generateQueryString = (options?: GetAllOptions) => {
	if (options) {
		const paths: string[] = [];

		if ((options.pageIndex ?? -1) >= 0) {
			paths.push(`pageIndex=${options.pageIndex}`);
		}
		if ((options.pageSize ?? 0) > 0) {
			paths.push(`pageSize=${options.pageSize}`);
		}

		return paths.length > 0 ? `?${paths.join("&")}` : "";
	}
	return "";
};

class NoteService {
	getAll(options?: GetAllOptions) {
		return new Promise<Note[]>((resolve, reject) => {
			server
				.get<Note[]>(`/note${generateQueryString(options)}`)
				.then((res) => {
					if (res.data) {
						resolve(res.data);
						return;
					}
					reject({ message: "Failed to get the notes" });
				})
				.catch((error) => reject(error));
		});
	}

	get(id: string) {
		return new Promise<Note>((resolve, reject) => {
			server
				.get<Note>(`/note/${id}`)
				.then((res) => {
					if (res.data) {
						resolve(res.data);
						return;
					}
					reject({ message: "Failed to get the note" });
				})
				.catch((error) => reject(error));
		});
	}

	save(note: NoteFormDetails) {
		return new Promise<Note>((resolve, reject) => {
			const isCreate = !note._id;
			const method = isCreate ? "post" : "put";
			server[method]<SaveResponse>(`/note/${note._id ?? ""}`, note)
				.then((res) => {
					if (res.data?.note?._id) {
						resolve(res.data.note);
						return;
					}
					reject({ message: "Failed to save/update" });
				})
				.catch((error) => reject(error));
		});
	}

	delete(id: string) {
		return new Promise<boolean>((resolve, reject) => {
			server
				.delete<DeleteResponse>(`/note/${id}`)
				.then((res) => resolve(res.data?.success ?? false))
				.catch((error) => reject(error));
		});
	}
}

export const noteService = new NoteService();
