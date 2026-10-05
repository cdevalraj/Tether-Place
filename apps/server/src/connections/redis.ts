import { createClient, type RedisClientType } from "redis";
import config from "../config.ts";

// TODO: implement a scheduler to systematically clean the cache

const publisher = createClient({ url: config.cache_url });
const subscriber: RedisClientType = publisher.duplicate();

// publisher.on("connect", () => console.log("Connected to redis"));

publisher.on("error", (error) =>
	console.error("Redis Publisher Client Error:", error),
);

subscriber.on("error", (error) =>
	console.error("Redis Subscriber Client Error:", error),
);

export const setEx = (
	key: string,
	value: string,
	ttl: number = config.cache_ttl,
) => publisher.setEx(key, ttl, value);

export const connectRedis = async () => {
	await Promise.all([publisher.connect(), subscriber.connect()]);
	console.log("Successfully connected to Redis");
};

export { publisher, subscriber };
