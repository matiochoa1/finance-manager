import mongoose from "mongoose";
import { Schema, Document, Types } from "mongoose";

export type FinancialMonthStatus = "pending" | "in_progress" | "completed";

export interface IFinancialMonth extends Document {
	year: number;
	month: number;
	users: Types.ObjectId[]; // Array of user IDs that share this month
	availableBalance: number;
	createdAt: Date;
	completed?: boolean;
	status: FinancialMonthStatus;
	previousMonthLeftover?: number; // Amount left over from the previous month
}

// Define the schema for FinancialMonth
const FinancialMonthSchema: Schema = new Schema({
	year: {
		type: Number,
		required: true,
	},
	month: {
		type: Number,
		required: true,
	},
	users: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	availableBalance: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	completed: {
		type: Boolean,
		default: false, // Indicates if the month is completed
	},
	previousMonthLeftover: {
		type: Number,
		default: 0, // Amount left over from the previous month
	},
});

const FinancialMonth = mongoose.model<IFinancialMonth>(
	"FinancialMonth",
	FinancialMonthSchema
); // Create the model from the schema
export default FinancialMonth; // Export the model for use in other parts of the application
