import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Note } from "../../../schema/Note";

interface NotesListProps {
	view?: "list" | "grid";
	notes: Note[];
}

const truncateText = (str: string) => {
	return `${str.substring(0, 101)}${str.length > 100 ? "..." : ""}`;
};

const getDateString = (str: string) => {
	return str.split("T")[0];
};

const NotesList = (props: NotesListProps) => {
	const viewType = props.view ?? "grid";
	const [notes, _setNotes] = useState(props.notes);

	return (
		<div className={`notes-${viewType}`}>
			{notes.map((note, index) => {
				return (
					<Link
						key={`id:${note._id}_idx:${String(index)}`}
						to={`/notes/$noteId`}
						params={{ noteId: note._id }}
					>
						<div className="compact-note">
							<div className="note-header">
								<h4>{note.title}</h4>
								<h4 title="created on">{getDateString(note.createdAt)}</h4>
							</div>
							<p className="note-content">{truncateText(note.content)}</p>
							<div className="meta-data">
								<h4 title="created by">{note.createdBy}</h4>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default NotesList;
