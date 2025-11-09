// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

// 📘 API docs imports
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";
import openapiSpec from "./docs/openapi.js"; // make sure this file exists & exports default

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// API routes
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);

// --------------------
// API documentation
// --------------------

// Swagger UI (interactive)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

// Raw OpenAPI JSON (also used by Redoc)
app.get("/api-docs.json", (_req, res) => res.json(openapiSpec));

// Redoc (read-only docs)
app.get("/redoc", redoc({ title: "TripShare API Docs", specUrl: "/api-docs.json" }));

// Optional landing
app.get("/", (_req, res) => {
  res.send(
    'Transport API is running 🚀 — visit /api-docs/api-docs</a> or /redoc/redoc</a>'
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));