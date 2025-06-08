import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middlewares/validation";

const router = Router();

router.post(
	"/create-user",
	body("name").notEmpty().withMessage("El nombre es obligatorio"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("La contraseña debe tener al menos 8 caracteres"),
	body("email")
		.isEmail()
		.withMessage("El email es obligatorio y debe ser válido"),
	handleInputErrors,
	AuthController.createUser
);

router.get("/get-user", AuthController.getUserByEmail);

export default router;
