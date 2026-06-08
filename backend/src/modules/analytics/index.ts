export {
  getStrategyMetrics,
  getAccountMetrics,
  getRecentTrades,
  getDailyPnL,
} from "./controllers/analytics.controller.js";

export { default as analyticsRoutes } from "./routes/analytics.routes.js";

export { analyticsService } from "./services/analytics.service.js";

export type { IAnalyticsMetrics } from "./types/analytics.types.js";
