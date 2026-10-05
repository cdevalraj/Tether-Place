import { useNavigate } from "@tanstack/react-router";
import FormSubmitButton from "../../../components/FormSubmitButton";
import { LoginSchema } from "../../../schema/User";
import { authService } from "../services/authService";

const LoginForm = () => {
	const navigation = useNavigate();

	const submitAction = async (formData: FormData) => {
		const data = Object.fromEntries(formData.entries());
		const parsedData = LoginSchema.safeParse(data);

		if (parsedData.success) {
			try {
				const success = await authService.login(parsedData.data);
				if (!success) {
					console.log("Handle creation failure");
					return;
				}
				navigation({ to: "/" });
			} catch (error) {
				console.log("Handle creation failure", error);
			}
		} else {
			console.log("Invalid data");
		}
	};

	return (
		<form action={submitAction} className="auth-form">
			<div className="input-field">
				<label htmlFor="userIdentifier">Username or Email</label>
				<input
					type="text"
					placeholder="Your username or email"
					id="userIdentifier"
					name="userIdentifier"
					maxLength={70}
					autoComplete="on"
					required
				/>
			</div>
			<div className="input-field">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Your password"
					maxLength={24}
					pattern={authService.regex.password}
					autoComplete="on"
					required
				/>
			</div>
			{/* <div>
				<input type="checkbox" id="persist" name="persist" />
				<label htmlFor="persist">Trust This Device</label>
			</div> */}
			<div className="action-container">
				<FormSubmitButton waitingText="Logging in..." actionText="Login" />
			</div>
		</form>
	);
};

export default LoginForm;
