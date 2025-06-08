import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectToDB = async () => {
	try {
		const { connection } = await mongoose.connect(process.env.DATABASE_URL);
		const url = `connection to DB: ${connection.host}:${connection.port}`;
		console.log(
			colors.bgGreen.bold(` MongoDB connected successfully: ${url} `)
		);
	} catch (error) {
		console.log(
			colors.bgRed.bold(` Error connecting to DB: ${error.message} `)
		);
		exit(1);
	}
};
