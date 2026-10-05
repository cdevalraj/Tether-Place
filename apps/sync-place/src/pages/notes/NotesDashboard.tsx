import { Link, useLoaderData } from "@tanstack/react-router";
import NotesList from "../../features/notes/components/NotesList";

const NotesDashboard = () => {
	const { notes } = useLoaderData({ from: "/notes/" });

	return (
		<div className="main-content">
			<div className="dashboard-header">
				<h1>Notes Dashboard</h1>
				<Link to="/notes/$noteId" params={{ noteId: "NEW" }} className="btn">
					Create Note
				</Link>
			</div>
			<NotesList notes={notes} />
		</div>
	);
};

export default NotesDashboard;
