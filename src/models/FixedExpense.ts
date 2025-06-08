import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFixedExpense extends Document {
	name: string;
	amount: number;
	shared: boolean;
	isVariable?: boolean;
	createdBy: Types.ObjectId;
}

const FixedExpenseSchema: Schema = new Schema({
	name: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	shared: {
		type: Boolean,
		default: false,
	},
	isVariable: {
		type: Boolean,
		default: false,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

const FixedExpense = mongoose.model<IFixedExpense>(
	"FixedExpense",
	FixedExpenseSchema
);
export default FixedExpense;
