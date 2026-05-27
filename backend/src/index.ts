import express from "express";
import cors from "cors";
import { config, validateConfig } from "./config/index.js";
import logger from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import strategyRoutes from "./routes/strategyRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Validate environment
validateConfig();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Request logging
app.use((req, _res, next) => {
  logger.debug("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/webhook", webhookRoutes);
app.use("/trades", tradeRoutes);
app.use("/strategies", strategyRoutes);
app.use("/accounts", accountRoutes);
app.use("/analytics", analyticsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.server.nodeEnv,
  });
});

export default app;
