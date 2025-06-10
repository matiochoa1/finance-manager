import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post(
	"/create-account",
	body("name").notEmpty().withMessage("El nombre es obligatorio"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("La contraseña debe tener al menos 8 caracteres"),
	body("password_confirmation").custom((value, { req }) => {
		if (value != req.body.password) {
			throw new Error("Las contraseñas no coinciden");
		}

		return true;
	}),
	body("email")
		.isEmail()
		.withMessage("El correo es obligatorio y debe ser válido"),
	handleInputErrors,
	AuthController.createUser
);

router.post(
	"/confirm-account",
	body("token").notEmpty().withMessage("El token es obligatorio"),
	handleInputErrors,
	AuthController.confirmAccount
);

router.post(
	"/login",
	body("email")
		.isEmail()
		.withMessage("El correo es obligatorio y debe ser válido"),
	body("password").notEmpty().withMessage("La contraseña no puede ir vacia"),
	handleInputErrors,
	AuthController.login
);

router.post(
	"/request-code",
	body("email").isEmail().withMessage("Correo no válido"),
	handleInputErrors,
	AuthController.requestConfirmationCode
);

router.post(
	"/reset-password",
	body("email").isEmail().withMessage("El correo no es válido"),
	handleInputErrors,
	AuthController.forgotPassword
);

router.post(
	"/validate-token",
	body("token").notEmpty().withMessage("El token es obligatorio"),
	handleInputErrors,
	AuthController.validateToken
);

router.post(
	"/update-password/:token",
	param("token").isNumeric().withMessage("El token no es válido"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("La contraseña debe tener al menos 8 carácteres"),
	body("password_confirmation").custom((value, { req }) => {
		if (value != req.body.password) {
			throw new Error("Las contraseñas no coinciden");
		}

		return true;
	}),
	handleInputErrors,
	AuthController.updatePasswordWithToken
);

router.post(
	"/check-password",
	authenticate,
	body("password").notEmpty().withMessage("La contraseña es obligatoria"),
	handleInputErrors,
	AuthController.checkPassword
);

// Gets
router.get("/get-user", authenticate, AuthController.getUser);

export default router;
