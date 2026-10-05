import mongoose from "mongoose";

const mongooseClient = mongoose;
mongooseClient.set("strictQuery", true);

mongooseClient.connection.on("connected", () => {
	console.log("Mongoose successfully connected to the database.");
});

mongooseClient.connection.on("error", (err) => {
	console.error("Mongoose connection error:", err);
});

mongooseClient.connection.on("disconnected", () => {
	console.log("Mongoose disconnected from the database.");
});

export { mongooseClient };
