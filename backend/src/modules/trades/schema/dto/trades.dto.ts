import z from "zod";

export const createTradeSchema = z.object({
  symbol: z.string(),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive(),
  quantity: z.number().positive(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  strategyId: z.string(),
});

export const signalFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  symbol: z.string().optional(),
  isDuplicate: z.coerce.boolean().optional(),
});

export const tradeFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(["OPEN", "CLOSED", "REJECTED"]).optional(),
  symbol: z.string().optional(),
});
