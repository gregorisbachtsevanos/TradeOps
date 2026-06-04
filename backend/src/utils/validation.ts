import { z } from "zod";

export const tradingViewWebhookSchema = z.object({
  passphrase: z.string(),
  time: z.string().datetime(),
  ticker: z.string(),
  close: z.number().positive(),
  strategy_signal: z.enum(["BUY", "SELL", "CLOSE"]),
  account_id: z.string().optional(),
  quantity: z.number().positive().optional(),
});

export const createTradeSchema = z.object({
  symbol: z.string(),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive(),
  quantity: z.number().positive(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  strategyId: z.string(),
});

export const createStrategySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  riskPercent: z.number().positive().max(100),
});

export const updateStrategySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  riskPercent: z.number().positive().max(100).optional(),
  isActive: z.boolean().optional(),
});

export const createAccountSchema = z.object({
  externalId: z.string(),
  balance: z.number().positive(),
  equity: z.number().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
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
