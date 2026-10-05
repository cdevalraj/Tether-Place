import { useNavigate } from "@tanstack/react-router";
import FormSubmitButton from "../../../components/FormSubmitButton";
import { RegisterationSchema } from "../../../schema/User";
import { authService } from "../services/authService";

const RegisterationForm = () => {
	const navigation = useNavigate();

	const submitAction = async (formData: FormData) => {
		const data = JSON.parse(
			JSON.stringify(Object.fromEntries(formData.entries())),
		);
		data.birthdate = new Date(data.birthdate ?? "");
		const parsedData = RegisterationSchema.safeParse(data);
		if (parsedData.success) {
			try {
				const success = await authService.register(parsedData.data);
				if (!success) {
					console.log("Handle creation failure");
					return;
				}
				navigation({ to: "/auth/login" });
			} catch (error) {
				console.log("Unknown Error", error);
			}
		} else {
			console.log("Invalid data");
		}
	};

	return (
		<form action={submitAction} className="auth-form">
			<div className="input-field">
				<label htmlFor="name">Name</label>
				<input
					id="name"
					type="text"
					name="name"
					maxLength={70}
					placeholder="First & Last name"
					pattern={authService.regex.name}
					required
				/>
			</div>
			<div className="input-field">
				<label htmlFor="birthdate">Date of birth</label>
				<input id="birthdate" type="date" name="birthdate" required />
			</div>
			<div className="input-field">
				<label htmlFor="email">Email</label>
				<input
					id="email"
					type="email"
					name="email"
					placeholder="Email"
					pattern={authService.regex.email}
					required
				/>
			</div>
			<div className="input-field">
				<label htmlFor="password">Password</label>
				<input
					id="password"
					type="password"
					name="password"
					maxLength={24}
					pattern={authService.regex.password}
					autoComplete="on"
					required
				/>
			</div>
			<div className="input-field">
				<label htmlFor="repassword">Confirm Password</label>
				<input
					id="repassword"
					type="password"
					name="repassword"
					maxLength={24}
					pattern={authService.regex.password}
					autoComplete="on"
					required
				/>
			</div>
			<div className="action-container">
				<input type="reset" className="btn" />
				<FormSubmitButton waitingText="Creating..." actionText="Create" />
			</div>
		</form>
	);
};

export default RegisterationForm;
