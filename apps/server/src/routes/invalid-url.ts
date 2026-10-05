import type { Request, Response } from "express";

export const invalidUrlHandler = (req: Request, res: Response) => {
	const message = `The url '${req.url}' that you are trying to reach is invalid...`;
	const result = { success: false, message };
	res.status(404).json(result);
};
