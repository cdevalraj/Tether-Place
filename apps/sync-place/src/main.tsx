import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import "./styles/auth.css";
import "./styles/notes.css";
import "./styles/home.css";
import "./styles/rooms.css";
import ConfigError from "./components/ConfigError.tsx";
import { config } from "./config.ts";

const rootDiv = document.getElementById("root");

if (rootDiv) {
	createRoot(rootDiv).render(
		<StrictMode>{config.isValid ? <App /> : <ConfigError />}</StrictMode>,
	);
}
