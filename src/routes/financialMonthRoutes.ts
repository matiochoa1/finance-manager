import { Router } from "express";
import { body, param } from "express-validator";
import { FinancialMonthController } from "../controllers/FinancialMonthController";
import { handleInputErrors } from "../middlewares/validation";

const router = Router(); // We instantiate the router

router.post(
	"/create-month",
	body("year").notEmpty().withMessage("El año es obligatorio"),
	body("month").notEmpty().withMessage("El mes es obligatorio"),
	body("users")
		.isArray({ min: 1 })
		.withMessage("Debe proporcionar al menos un usuario"),
	handleInputErrors,
	FinancialMonthController.createFinancialMonth
);

router.post(
	"/create-year",
	body("year").notEmpty().withMessage("El año es obligatorio"),
	body("users")
		.isArray({ min: 1 })
		.withMessage("Debe proporcionar al menos un usuario"),
	handleInputErrors,
	FinancialMonthController.createFinancialYear
);

export default router;
