import type { Request, Response } from "express";
import {
	createFinancialMonth,
	createFinancialYear,
} from "../services/FinancialMonth.service";
import FinancialMonth from "../models/FinancialMonth";
import User from "../models/User";

export class FinancialMonthController {
	// Static method so it can be called without instantiating the class

	// Method to create a financial month
	static createFinancialMonth = async (req: Request, res: Response) => {
		try {
			const { month, year, users } = req.body;

			if (!year || !month || !users || !Array.isArray(users)) {
				res.status(400).json({ error: "Datos invalidos o incompletos" });
				return;
			}

			// Validate only months between 1 and 12
			if (month < 1 || month > 12) {
				res.status(400).json({ error: "El mes debe estar entre 1 y 12" });
				return;
			}

			// Check if the month already exists and has been created in a specific year
			const existingMonth = await FinancialMonth.findOne({
				year,
				month,
			});
			if (existingMonth) {
				res.status(400).json({
					error: "El mes financiero ya ha sido creado para este año",
				});
				return;
			}

			// Check that the user exists
			const foundUsers = await User.find({ _id: { $in: users } });
			if (foundUsers.length !== users.length) {
				res.status(400).json({
					error: "Uno o más usuarios no existen",
				});
				return;
			}

			const newMonth = await createFinancialMonth(year, month, users);
			res.status(201).json(newMonth);
		} catch (error) {
			console.error("Error creating financial month:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	// Method to create a financial year
	static createFinancialYear = async (req: Request, res: Response) => {
		try {
			const { year, users } = req.body;
			if (!year || !users || !Array.isArray(users)) {
				res.status(400).json({ error: "Datos invalidos o incompletos" });
				return;
			}

			// Validate that the user exists
			const foundUsers = await User.find({ _id: { $in: users } });
			if (foundUsers.length !== users.length) {
				res.status(400).json({
					error: "Uno o más usuarios no existen",
				});
				return;
			}

			const months = await createFinancialYear(year, users);
			res.status(201).json(months);
		} catch (error) {
			console.error("Error creating financial year:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	// Method to get the financial month by month number and year
	static getFinancialMonthByYearAndMonth = async (
		req: Request,
		res: Response
	) => {
		const { year, month } = req.params;
		try {
			const financialMonth = await FinancialMonth.findOne({
				year: parseInt(year),
				month: parseInt(month),
			}).populate("users", "name email"); // Populate users with name and email

			if (!financialMonth) {
				res.status(404).json({ error: "El mes no ha sido encontrado" });
			}

			res.json(financialMonth);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Error al obtener el mes financiero" });
		}
	};
}
