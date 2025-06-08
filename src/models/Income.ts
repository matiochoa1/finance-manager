import mongoose, { Schema, Document, Types } from "mongoose";

export type IncomeType = "nomina" | "extra" | "bizum";

export interface IIncome extends Document {
	month: Types.ObjectId;
	user: Types.ObjectId;
	type: IncomeType;
	amount: number;
	date: Date;
	description?: string;
}

const IncomeSchema: Schema = new Schema({
	month: {
		type: Schema.Types.ObjectId,
		ref: "FinancialMonth",
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	type: {
		type: String,
		enum: ["nomina", "extra", "bizum"],
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

const Income = mongoose.model<IIncome>("Income", IncomeSchema);
export default Income;
