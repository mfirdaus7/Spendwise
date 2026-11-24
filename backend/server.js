import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import dashboardRoutes from "./routes/dashboard.js";
import budgetRoutes from "./routes/budgets.js";

dotenv.config({ path: "backend/.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "SpendWise API" }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetRoutes);

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error);
  res.status(500).json({ message: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`SpendWise API running at http://localhost:${port}`);
});