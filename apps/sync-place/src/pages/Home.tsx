import { Link, useLoaderData } from "@tanstack/react-router";
import NotesList from "../features/notes/components/NotesList";
import { useAuthStore } from "../store/auth";

const features = [
	{
		title: "Notes",
		description: "You can create and modify notes",
	},
	{
		title: "Video Chat Room",
		description: "You can create and join rooms to meet/chat with others",
	},
];

const Home = () => {
	const isAuthenticated = useAuthStore((s) => !!s.accessToken);
	const { notes } = useLoaderData({ from: "/" });

	return (
		<div className="main-content">
			<div className="home-hero">
				<h1>Sync Place</h1>
			</div>
			<div className="home-content-container">
				{isAuthenticated ? (
					<>
						<div className="info-section">
							<h3>Quick Access</h3>
							<NotesList notes={notes} />
							<Link to="/notes" className="btn">
								Create/View all notes
							</Link>
						</div>
						<div className="call-to-action">
							<Link to="/rooms" className="overlay btn">
								Join/Create room
							</Link>
						</div>
					</>
				) : (
					<div className="info-section">
						<h3>What it has is...</h3>
						<div className="features">
							{features.map((feature) => (
								<div key={feature.title} className="card">
									<h3>{feature.title}</h3>
									<p>{feature.description}</p>
								</div>
							))}
						</div>
						<Link to="/auth/register" className="overlay btn">
							Join to explore
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
