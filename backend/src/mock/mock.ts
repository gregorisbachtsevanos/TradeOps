process.env.MOCK_DATA = "true";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.TRADING_VIEW_WEBHOOK_SECRET =
  process.env.TRADING_VIEW_WEBHOOK_SECRET || "mock-secret-key";

import("../index.js").catch((error) => {
  console.error(error);
  process.exit(1);
});
