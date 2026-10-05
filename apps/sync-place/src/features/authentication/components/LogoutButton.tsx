import { useNavigate } from "@tanstack/react-router";
import { type MouseEventHandler, useState } from "react";
import { authService } from "../services/authService";

interface LogoutButtonProps {
	label?: string;
	loadingLabel?: string;
}

const LogoutButton = (props: LogoutButtonProps) => {
	const label = props.label ?? "Logout";
	const loadingLabel = props.loadingLabel ?? "Logging out...";
	const navigation = useNavigate();

	const [loading, setLoading] = useState(false);

	const clickHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			if (await authService.logout()) {
				navigation({ to: "/auth/login" });
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button onClick={clickHandler} type="button">
			{loading ? loadingLabel : label}
		</button>
	);
};

export default LogoutButton;
