import NestedRouteLayout from "../../../layouts/NestedRouteLayout";

const AuthenticationRouteLayout = () => {
	return (
		<NestedRouteLayout
			className="auth-page"
			links={[
				{ label: "Register", linkOptions: { to: "/auth/register" } },
				{ label: "Login", linkOptions: { to: "/auth/login" } },
			]}
		/>
	);
};

export default AuthenticationRouteLayout;
