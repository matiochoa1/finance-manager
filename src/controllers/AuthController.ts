import type { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../utils/auth";

export class AuthController {
	// Static method to register a new user
	static createUser = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;

			// Prevent duplicates
			const userExists = await User.findOne({ email });
			if (userExists) {
				const error = new Error("El usuario ya existe");
				res.status(400).json({ error: error.message });
				return;
			}

			// Create a new user
			const user = new User(req.body);

			// Encrypt the password
			user.password = await hashPassword(password);

			await user.save();

			res.send("Cuenta creada correctamente");
		} catch (error) {
			res.status(500).json({ error: "Error al crear la cuenta" });
		}
	};

	// Static method to get an user by email
	static getUserByEmail = async (req: Request, res: Response) => {
		const { email } = req.body;

		// Search for the user
		const user = await User.findOne({ email }).select("id name email");

		if (!user) {
			res.status(404).json({ error: "Usuario no encontrado" });
			return;
		}

		res.json({ user });
	};
}
