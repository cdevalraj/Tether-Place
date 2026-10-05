import { Config } from "common/Config";

class ClientConfig extends Config {
	server_url = "";
	ws_server_url = "";

	protected override validateFields(): void {
		this.require("server_url", this.server_url);
		this.require("ws_server_url", this.ws_server_url);
	}
}

const createConfig = () => {
	const mode = import.meta.env.VITE_MODE ?? "development";
	const config = new ClientConfig(mode);

	config.server_url =
		import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000";
	config.ws_server_url =
		import.meta.env.VITE_WS_SERVER_URL ?? "ws://localhost:8000";

	config.validate();

	return config;
};

export const config = createConfig() as Readonly<ClientConfig>;
