import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const bearer = req.headers.authorization; // storing token in bearer which comes from header in the req

	if (!bearer) {
		const error = new Error("No autorizado");

		res.status(401).json({ error: error.message });
	}

	const [, token] = bearer.split(" "); // array destructuring to split bearer from token

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Verify valid token to decode it and obtain user info
		if (typeof decoded === "object" && decoded.id) {
			const user = await User.findById(decoded.id).select("_id name email");

			if (user) {
				req.user = user;

				next();
			} else {
				res.status(500).json({ error: "Usuario no encontrado" });
			}
		}
	} catch (error) {
		res.status(500).json({ error: "Invalid token" });
	}
};
