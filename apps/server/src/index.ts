import http from "node:http";
import { createLightship } from "lightship";
import app from "./app.ts";
import config from "./config.ts";
import { mongooseClient } from "./connections/mongoose.ts";
import { connectRedis } from "./connections/redis.ts";
import { upgradeHandler } from "./connections/websocket.ts";

const server = http.createServer(app);

async function startServer() {
	const lightship = await createLightship({
		detectKubernetes: false,
		port: 9000,
	});

	await connectRedis();
	await mongooseClient.connect(config.db_url);

	server
		.listen(config.port, () => {
			console.log(`Server started on port: ${config.port}`);
			lightship.signalReady();
		})
		.on("upgrade", upgradeHandler)
		.on("close", () => {
			console.log("Server Closed");
			lightship.shutdown();
		})
		.on("error", (error) => {
			console.error("Server Error", error);
			lightship.shutdown();
		});

	lightship.registerShutdownHandler(() => {
		server.close();
	});
}

startServer().catch((error) => {
	console.error(error);
});
