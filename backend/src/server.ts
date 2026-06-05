import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import { config } from "dotenv";

// Load environment variables
config();

// Import routes and middleware
import { authRoutes } from "./routes/auth.js";
import { storeRoutes } from "./routes/stores.js";
import { productRoutes } from "./routes/products.js";
import { orderRoutes } from "./routes/orders.js";
import { reviewRoutes } from "./routes/reviews.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Public routes
app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Protected routes
app.use(authMiddleware);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api-docs`);
});
