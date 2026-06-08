export { tradeEngineService } from "./services/tradeEngine.service.js";

export {
  listTrades,
  getTrade,
  getTradeLivePrice,
  closeTrade,
} from "./controllers/trade.controller.js";

export { default as tradeRoutes } from "./routes/trade.routes.js";

export type {
  ITradeIntent,
  ITradeExecutionResult,
} from "./schema/types/trades.types.js";

export {
  createTradeSchema,
  signalFilterSchema,
  tradeFilterSchema,
} from "./schema/dto/trades.dto.js";
