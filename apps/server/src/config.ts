import { Config } from "common/Config";

class ServerConfig extends Config {
	default_site = "";
	port = 8000;
	cache_ttl = 86400; // one day
	db_url = "";
	cache_url = "";
	access_token_secret = "";
	refresh_token_secret = "";

	protected override validateFields(): void {
		this.require("port", this.port);
		this.require("db_url", this.db_url);
		this.require("cache_url", this.cache_url);
		this.require("access_token_secret", this.access_token_secret);
		this.require("refresh_token_secret", this.refresh_token_secret);
	}
}

const createConfig = () => {
	const mode = process.env.NODE_ENV ?? "development";
	const config = new ServerConfig(mode);

	config.port = Number(process.env.SERVER_PORT ?? config.port);
	config.cache_ttl = Number(process.env.CACHE_TTL ?? config.cache_ttl);
	config.default_site = process.env.SERVER_SITE ?? "";
	config.db_url = process.env.DB_URL ?? "";
	config.cache_url = `redis://${process.env.CACHE_HOST ?? "localhost"}:${process.env.CACHE_PORT ?? 6379}`;
	config.access_token_secret = process.env.ACCESS_TOKEN_SECRET ?? "";
	config.refresh_token_secret = process.env.REFRESH_TOKEN_SECRET ?? "";

	config.validate();

	return config;
};

const config = createConfig() as Readonly<ServerConfig>;

if (!config.isValid) {
	console.log("ERROR: invalid/missing configuration, check environment setup.");

	config.validation_messages.forEach((msg) => {
		console.log(`  -${msg}`);
	});

	process.exit(1);
}

export default config;
