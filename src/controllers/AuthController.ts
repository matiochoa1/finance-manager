import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateSixDigitsToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
	// Static method to register a new user
	static createUser = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

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

			// Generate confirmation token
			const token = new Token();
			token.token = generateSixDigitsToken();
			token.user = user.id;

			// Send email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			await Promise.allSettled([user.save(), token.save()]);

			res.send("Cuenta creada correctamente");
		} catch (error) {
			res.status(500).json({ error: "Error al crear la cuenta" });
		}
	};

	// Static method to confirm the account
	static confirmAccount = async (req: Request, res: Response) => {
		try {
			const { token } = req.body;

			const tokenExists = await Token.findOne({ token });

			if (!tokenExists) {
				const error = new Error("El token no es valido o no existe");
				res.status(403).json({ error: error.message });
			}

			const user = await User.findById(tokenExists.user);
			user.confirmed = true;

			await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

			res.send("Cuenta confirmada correctamente!");
		} catch (error) {
			res.status(500).json({
				error:
					"Hubo un error al intentar confirmar la cuenta, por favor intentelo de nuevo",
			});
		}
	};

	// Method to login
	static login = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

			const user = await User.findOne({ email });

			if (!user) {
				const error = new Error("El usuario no existe");
				res.status(404).json({ error: error.message });
				return;
			}

			if (!user.confirmed) {
				const token = new Token();
				token.user = user.id;
				token.token = generateSixDigitsToken();

				await token.save();

				// Send the email
				AuthEmail.sendConfirmationEmail({
					email: user.email,
					name: user.name,
					token: token.token,
				});

				const error = new Error(
					"La cuenta no ha sido confirmada, hemos enviado un correo de confirmación."
				);

				res.status(401).json({ error: error.message });
				return;
			}

			// Check matching passwords
			const passwordMatch = await checkPassword(password, user.password);

			if (!passwordMatch) {
				const error = new Error("La contraseña es incorrecta.");
				res.status(401).json({ error: error.message });
				return;
			}

			// Generate JWT
			const token = generateJWT({ id: user.id });

			res.send(token);
		} catch (error) {
			res
				.status(500)
				.json({ error: "Hubo un error al intentar iniciar sesión." });
		}
	};

	// Method to request confirmation code
	static requestConfirmationCode = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;

			// Check if user exists
			const user = await User.findOne({ email });
			if (!user) {
				const error = new Error("El usuario no está registrado");
				res.status(401).json({ error: error.message });
				return;
			}

			if (user.confirmed) {
				const error = new Error("El usuario ya está confirmado");
				res.status(409).json({ error: error.message }); // 409 - Conflict error
				return;
			}

			// Generate token
			const token = new Token();
			token.user = user.id;
			token.token = generateSixDigitsToken();

			// Send the email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			await Promise.allSettled([user.save(), token.save()]);

			res.send("Se envió un nuevo token de confirmación a tu correo.");
		} catch (error) {
			res
				.status(500)
				.json({ error: "Error al enviar el codigo de confirmación." });
		}
	};

	// method to allow user to create a new password
	static forgotPassword = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;
			const user = await User.findOne({ email });

			if (!user) {
				const error = new Error(
					"El usuario no es correcto o no está registrado."
				);
				res.status(404).json({ error: error.message });
			}

			// Generate confirmation token
			const token = new Token();
			token.token = generateSixDigitsToken();
			token.user = user.id;
			await token.save();

			// send email
			AuthEmail.sendPasswordResetToken({
				email: user.email,
				name: user.name,
				token: token.token,
			});

			res.send("Revisa tu correo para reestablecer tu contraseña");
		} catch (error) {
			res.status(500).json({
				error: "Hubo un error al intentar generar una nueva contraseña",
			});
		}
	};

	// Validate token
	static validateToken = async (req: Request, res: Response) => {
		try {
			const { token } = req.body;
			const tokenExists = await Token.findOne({ token });

			if (!tokenExists) {
				const error = new Error("El token no es válido");
				res.status(403).json({ error: error.message });
				return;
			}

			res.send("Token válido, define tu nueva contraseña");
		} catch (error) {
			res.status(500).json({ error: "Hubo un error" });
		}
	};

	// Update password with a token
	static updatePasswordWithToken = async (req: Request, res: Response) => {
		try {
			const { token } = req.params;
			const { password } = req.body;
			const tokenExists = await Token.findOne({ token });

			if (!tokenExists) {
				const error = new Error("El token no es válido");
				res.status(403).json({ error: error.message });
			}

			const user = await User.findById(tokenExists.user);
			user.password = await hashPassword(password);

			await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

			res.send("La constraseña se actualizó correctamente");
		} catch (error) {
			res.status(500).json({ error: "Hubo un error" });
		}
	};

	// Static method to get an user by email
	static getUser = async (req: Request, res: Response) => {
		res.json(req.user);
	};

	// Method to check password
	static checkPassword = async (req: Request, res: Response) => {
		const { password } = req.body;

		const user = await User.findById(req.user.id);

		const isPasswordValid = await checkPassword(password, user.password);

		if (!isPasswordValid) {
			const error = new Error("La contraseña no es correcta.");
			res.status(401).json({ error: error.message });
			return;
		}

		res.send("Contraseña válida");
	};
}
