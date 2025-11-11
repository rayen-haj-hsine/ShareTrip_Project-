// server/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

import tripRoutes from "./routes/tripRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import openapiSpec from "./docs/openapi.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`TripShare API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
});