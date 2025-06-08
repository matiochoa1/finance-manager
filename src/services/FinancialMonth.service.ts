import { Types } from "mongoose";
import Expense from "../models/Expense";
import FinancialMonth from "../models/FinancialMonth";
import FixedExpense from "../models/FixedExpense";
import Income from "../models/Income";

export const calcMonthlyBalance = async (monthId: string) => {
	const incomes = await Income.find({ month: monthId });
	const expenses = await Expense.find({ month: monthId });

	const totalIncomes = incomes.reduce((acc, i) => acc + i.amount, 0);
	const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

	const balance = totalIncomes - totalExpenses;

	return {
		totalIncomes,
		totalExpenses,
		balance,
		diff: balance !== 0 ? balance : 0,
	};
};

// Create a new financial month with initial balance
export const createFinancialMonth = async (
	year: number,
	month: number,
	users: Types.ObjectId[]
) => {
	const previousMonth = await FinancialMonth.findOne({
		year,
		month: month - 1,
	});
	const leftover = previousMonth?.availableBalance || 0;

	const financialMonth = await FinancialMonth.create({
		year,
		month,
		users,
		availableBalance: leftover,
		status: "pending",
	});

	const fixedExpenses = await FixedExpense.find();

	for (const expense of fixedExpenses) {
		await Expense.create({
			month: financialMonth._id,
			type: "fijo",
			amount: expense.amount,
			name: expense.name,
			user: expense.shared ? undefined : expense.createdBy,
		});
	}

	return financialMonth;
};

// Create a financial year with initial months
export const createFinancialYear = async (
	year: number,
	users: Types.ObjectId[]
) => {
	const createdMonths = [];

	for (let m = 1; m <= 12; m++) {
		const monthExists = await FinancialMonth.findOne({ year, month: m });
		if (monthExists) continue; // Skip if month already exists

		const newMonth = await createFinancialMonth(year, m, users);
		createdMonths.push(newMonth);
	}

	return createdMonths;
};
