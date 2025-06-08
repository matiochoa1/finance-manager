import mongoose, { Schema, Document, Types } from "mongoose";

export type ExpenseType = "fijo" | "supermercado" | "ahorro" | "extra";

export interface IExpense extends Document {
	month: Types.ObjectId;
	user?: Types.ObjectId; // Can be a shared expense
	type: ExpenseType;
	amount: number;
	date: Date;
	description?: string;
}

const ExpenseSchema: Schema = new Schema({
	month: {
		type: Schema.Types.ObjectId,
		ref: "FinancialMonth",
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	type: {
		type: String,
		enum: ["fijo", "supermercado", "ahorro", "extra"],
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	description: {
		type: String,
	},
});

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
export default Expense; // Export the model for use in other parts of the application
