import { Link } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth";

const Header = () => {
	const isLoggedIn = useAuthStore((s) => !!s.accessToken);
	const pathRoute = isLoggedIn ? "/profile" : "/auth/login";
	const pathLabel = isLoggedIn ? "Profile" : "Login";

	return (
		<header>
			<nav>
				<Link to="/">Home</Link>
				<Link to={pathRoute}>{pathLabel}</Link>
			</nav>
		</header>
	);
};

export default Header;
