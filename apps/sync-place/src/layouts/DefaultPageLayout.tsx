import { Outlet } from "@tanstack/react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

const DefaultPageLayout = () => {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	);
};

export default DefaultPageLayout;
