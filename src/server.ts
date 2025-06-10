import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { connectToDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import financialMonthRoutes from "./routes/financialMonthRoutes";

dotenv.config(); // loading env

connectToDB();

const app = express();
app.use(cors(corsConfig));

// Logging
app.use(morgan("dev"));

// Read data from forms
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/financial-month", financialMonthRoutes);

export default app;
