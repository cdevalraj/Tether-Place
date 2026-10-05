import * as z from "zod";
import { authService } from "../features/authentication/services/authService";

export const UserSchema = z.object({
	name: z.string().regex(new RegExp(authService.regex.name)),
	email: z.string().regex(new RegExp(authService.regex.email)),
	birthdate: z.date(),
});

export const RegisterationSchema = UserSchema.extend({
	password: z.string().regex(new RegExp(authService.regex.password)),
	repassword: z.string().regex(new RegExp(authService.regex.password)),
});

export const LoginSchema = z.object({
	userIdentifier: z.string(),
	password: z.string().regex(new RegExp(authService.regex.password)),
});

export type User = z.infer<typeof UserSchema>;
export type RegisterationDetails = z.infer<typeof RegisterationSchema>;
export type LoginDetails = z.infer<typeof LoginSchema>;
