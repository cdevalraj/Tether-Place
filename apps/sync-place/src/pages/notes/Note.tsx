import { useLoaderData, useParams } from "@tanstack/react-router";
import NoteForm from "../../features/notes/components/NoteForm";

const Note = () => {
	const { note } = useLoaderData({ from: "/notes/$noteId" });
	const { noteId } = useParams({ from: "/notes/$noteId" });

	return (
		<div className="main-content">
			<NoteForm isNew={noteId === "NEW"} note={note} />
		</div>
	);
};

export default Note;
