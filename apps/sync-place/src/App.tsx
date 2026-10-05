import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routers";

export const router = createRouter({
	routeTree,
	// defaultPreload: "intent",
	// scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return <RouterProvider router={router} />;
}

export default App;
