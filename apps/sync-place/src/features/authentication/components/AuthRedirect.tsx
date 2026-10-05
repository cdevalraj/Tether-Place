import { Navigate } from "@tanstack/react-router";

const AuthRedirect = () => {
	return <Navigate to="/auth/login" replace />;
};

export default AuthRedirect;
