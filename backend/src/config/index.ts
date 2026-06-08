import dotenv from "dotenv";

dotenv.config();

export const isMockMode = process.env.APP_MODE === "mock";

export const config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "",
  },
  trading: {
    webhookSecret: process.env.TRADING_VIEW_WEBHOOK_SECRET || "",
  },
  broker: {
    apiBaseUrl: process.env.BROKER_API_BASE_URL || "",
    apiKey: process.env.BROKER_API_KEY || "",
    useMockBroker: isMockMode,
  },
  riskManagement: {
    maxDailyLossPercent: parseFloat(process.env.MAX_DAILY_LOSS_PERCENT || "5"),
    maxOpenTrades: parseInt(process.env.MAX_OPEN_TRADES || "10", 10),
    maxExposurePercent: parseFloat(process.env.MAX_EXPOSURE_PERCENT || "50"),
    positionRiskPercent: parseFloat(process.env.POSITION_RISK_PERCENT || "2"),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export const validateConfig = (): void => {
  if (!isMockMode && !config.database.url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!config.auth.jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  if (!config.trading.webhookSecret) {
    throw new Error(
      "TRADING_VIEW_WEBHOOK_SECRET environment variable is not set",
    );
  }
  if (
    !config.broker.useMockBroker &&
    (!config.broker.apiBaseUrl || !config.broker.apiKey)
  ) {
    throw new Error(
      "BROKER_API_BASE_URL and BROKER_API_KEY must be set when USE_MOCK_BROKER is not true",
    );
  }
};
