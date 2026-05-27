import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  trading: {
    webhookSecret: process.env.TRADING_VIEW_WEBHOOK_SECRET || "",
  },
  riskManagement: {
    maxDailyLossPercent: parseFloat(process.env.MAX_DAILY_LOSS_PERCENT || "5"),
    maxOpenTrades: parseInt(process.env.MAX_OPEN_TRADES || "10", 10),
    positionRiskPercent: parseFloat(process.env.POSITION_RISK_PERCENT || "2"),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export const validateConfig = (): void => {
  if (!config.database.url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!config.trading.webhookSecret) {
    throw new Error(
      "TRADING_VIEW_WEBHOOK_SECRET environment variable is not set",
    );
  }
};
