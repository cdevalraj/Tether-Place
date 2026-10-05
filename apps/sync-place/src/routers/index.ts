import { createRootRoute, createRoute } from "@tanstack/react-router";
import AuthRedirect from "../features/authentication/components/AuthRedirect";
import AuthenticationRouteLayout from "../features/authentication/layouts/AuthenticationRouteLayout";
import { tokenInitializer } from "../features/authentication/loaders/tokenInitializer";
import { noteDataLoader } from "../features/notes/loaders/noteDataLoader";
import { notesDataLoader } from "../features/notes/loaders/notesDataLoader";
import { verifyRoom } from "../features/rooms/loaders/verifyRoom";
import DefaultPageLayout from "../layouts/DefaultPageLayout";
import Login from "../pages/authentication/Login";
import Register from "../pages/authentication/Register";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";
import Note from "../pages/notes/Note";
import NotesDashboard from "../pages/notes/NotesDashboard";
import Profile from "../pages/Profile";
import Room from "../pages/rooms/Room";
import RoomsLobby from "../pages/rooms/RoomsLobby";
import { useAuthStore } from "../store/auth";
import { requireAnonymous, requireAuth } from "./routeGuards";

const rootRoute = createRootRoute({
	component: DefaultPageLayout,
	beforeLoad: tokenInitializer,
	errorComponent: ErrorPage,
});

const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	component: Home,
	loader: () => {
		return useAuthStore.getState().accessToken
			? notesDataLoader({ pageSize: 5 })
			: { notes: [] };
	},
	path: "/",
});

const authRoute = createRoute({
	getParentRoute: () => rootRoute,
	component: AuthenticationRouteLayout,
	beforeLoad: requireAnonymous,
	path: "auth",
});

const authRedirectRoute = createRoute({
	getParentRoute: () => authRoute,
	component: AuthRedirect,
	path: "/",
});

const loginRoute = createRoute({
	getParentRoute: () => authRoute,
	component: Login,
	path: "login",
});

const registerRoute = createRoute({
	getParentRoute: () => authRoute,
	component: Register,
	path: "register",
});

const profileRoute = createRoute({
	getParentRoute: () => rootRoute,
	beforeLoad: requireAuth,
	component: Profile,
	path: "profile",
});

const notesRoute = createRoute({
	getParentRoute: () => rootRoute,
	beforeLoad: requireAuth,
	path: "notes",
});

const notesDashboardRoute = createRoute({
	getParentRoute: () => notesRoute,
	loader: () => notesDataLoader(),
	component: NotesDashboard,
	path: "/",
});

const noteRoute = createRoute({
	getParentRoute: () => notesRoute,
	loader: noteDataLoader,
	component: Note,
	path: "$noteId",
});

const roomsRoute = createRoute({
	getParentRoute: () => rootRoute,
	beforeLoad: requireAuth,
	path: "rooms",
});

const roomsLobbyRoute = createRoute({
	getParentRoute: () => roomsRoute,
	component: RoomsLobby,
	path: "/",
});

const roomRoute = createRoute({
	getParentRoute: () => roomsRoute,
	beforeLoad: ({ params }) => verifyRoom(params.roomId),
	component: Room,
	path: "$roomId",
});

export const routeTree = rootRoute.addChildren([
	homeRoute,
	authRoute.addChildren([authRedirectRoute, loginRoute, registerRoute]),
	profileRoute,
	notesRoute.addChildren([notesDashboardRoute, noteRoute]),
	roomsRoute.addChildren([roomsLobbyRoute, roomRoute]),
]);
