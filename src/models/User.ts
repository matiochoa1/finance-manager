import mongoose, { Schema, Document } from "mongoose";

// Define the model of the user that is going to be stored in the database
export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	confirmed: boolean;
}

// Define the schema
export const UserSchema: Schema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		lowercase: true, // to avoid case sensitivity issues and duplicate emails
		unique: true, // we verify that the email is unique
	},
	password: {
		type: String,
		required: true,
	},
	confirmed: {
		type: Boolean,
		default: false, // by default user won't be confirmed, it must confirm via email
	},
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
