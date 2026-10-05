import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		birthdate: {
			type: Date,
			required: true,
		},
		role: {
			type: String,
			default: "user",
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		updatedAt: {
			type: Date,
			default: Date.now(),
		},
	},
	{ collection: "users" },
);

export const UserModel = mongoose.model("user", UserSchema);
