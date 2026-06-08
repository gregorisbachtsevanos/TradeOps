process.env.APP_MODE = process.env.APP_MODE || "mock";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.JWT_SECRET = process.env.JWT_SECRET || "mock-jwt-secret";
process.env.TRADING_VIEW_WEBHOOK_SECRET =
  process.env.TRADING_VIEW_WEBHOOK_SECRET || "mock-secret-key";

import("../index.js").catch((error) => {
  console.error(error);
  process.exit(1);
});
