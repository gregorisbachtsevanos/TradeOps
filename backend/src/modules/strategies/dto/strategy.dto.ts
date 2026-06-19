import z from "zod";

// Market options
const MARKET_OPTIONS = ["forex", "crypto", "stocks", "indices", "commodities", "bonds"] as const;
const INSTRUMENT_OPTIONS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF",
  "BTCUSD", "ETHUSD", "XAUUSD", "US30", "NAS100", "SPX500", "UK100",
] as const;
const TIMEFRAME_OPTIONS = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"] as const;
const CONDITION_OPTIONS = ["trending_bullish", "trending_bearish", "ranging", "breakout", "high_volatility", "low_volatility", "news_driven"] as const;
const SESSION_OPTIONS = ["london", "new_york", "sydney", "tokyo", "london_new_york_overlap"] as const;

// Entry rule schema
const EntryRuleSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["price_action", "indicator", "pattern", "level", "custom"]),
  name: z.string().min(1),
  description: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
  required: z.boolean().default(false),
});

// Confirmation schema
const ConfirmationSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["indicator", "price_action", "volume", "time", "pattern", "custom"]),
  name: z.string().min(1),
  description: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
  required: z.boolean().default(false),
});

// Stop loss schema
const StopLossSchema = z.object({
  type: z.enum(["atr", "percentage", "pivot", "structure", "fixed_pips", "custom"]),
  value: z.number().positive().optional(),
  atrMultiplier: z.number().positive().optional(),
  percentage: z.number().positive().max(100).optional(),
  pivotLevel: z.string().optional(),
  structureLevel: z.string().optional(),
  fixedPips: z.number().positive().optional(),
  description: z.string().optional(),
});

// Take profit target schema
const TpTargetSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["atr", "percentage", "pivot", "structure", "fixed_pips", "risk_reward", "custom"]),
  value: z.number().positive().optional(),
  atrMultiplier: z.number().positive().optional(),
  percentage: z.number().positive().max(100).optional(),
  pivotLevel: z.string().optional(),
  structureLevel: z.string().optional(),
  fixedPips: z.number().positive().optional(),
  riskReward: z.number().positive().min(1).optional(),
  partialPercent: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

// Trade management schema
const TradeManagementSchema = z.object({
  breakevenTrigger: z.number().positive().optional(),
  breakevenPips: z.number().positive().optional(),
  trailingStop: z.boolean().default(false),
  trailingStopPips: z.number().positive().optional(),
  trailingStopAt: z.number().positive().optional(),
  scaleIn: z.boolean().default(false),
  scaleInRules: z.array(z.any()).optional(),
  maxHoldTime: z.number().positive().optional(),
  description: z.string().optional(),
});

// Exit rule schema
const ExitRuleSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["time_based", "condition_based", "pattern", "indicator", "custom"]),
  name: z.string().min(1),
  description: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
});

// News rule schema
const NewsRuleSchema = z.object({
  avoidHighImpact: z.boolean().default(true),
  minutesBefore: z.number().int().positive().default(30),
  minutesAfter: z.number().int().positive().default(30),
  closeBeforeNews: z.boolean().default(false),
  newsEvents: z.array(z.string()).optional(),
  description: z.string().optional(),
});

// Checklist item schema
const ChecklistItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

// Backtesting metrics schema
const BacktestingMetricsSchema = z.object({
  totalTrades: z.number().int().min(0).optional(),
  winRate: z.number().min(0).max(100).optional(),
  avgWin: z.number().optional(),
  avgLoss: z.number().optional(),
  profitFactor: z.number().positive().optional(),
  maxDrawdown: z.number().positive().optional(),
  sharpeRatio: z.number().optional(),
  avgRR: z.number().positive().optional(),
  description: z.string().optional(),
});

// Create strategy schema
export const createStrategySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),

  // Market selection
  markets: z.array(z.enum(MARKET_OPTIONS)).min(1).default([]),
  instruments: z.array(z.enum(INSTRUMENT_OPTIONS)).optional(),

  // Timeframes
  analysisTimeframe: z.enum(TIMEFRAME_OPTIONS).optional(),
  entryTimeframe: z.enum(TIMEFRAME_OPTIONS).optional(),

  // Market conditions
  conditions: z.array(z.enum(CONDITION_OPTIONS)).optional(),

  // Trading sessions
  sessions: z.array(z.enum(SESSION_OPTIONS)).optional(),

  // Entry rules
  entryRules: z.array(EntryRuleSchema).min(1).optional(),

  // Confirmations
  confirmations: z.array(ConfirmationSchema).optional(),

  // Risk management
  riskPercent: z.number().positive().max(100).default(2),
  maxDailyLoss: z.number().positive().max(100).optional(),
  maxDrawdown: z.number().positive().max(100).optional(),
  maxOpenTrades: z.number().int().positive().optional(),
  maxDailyTrades: z.number().int().positive().optional(),

  // Stop loss
  stopLoss: StopLossSchema.optional(),

  // Take profit
  tpTargets: z.array(TpTargetSchema).optional(),

  // Trade management
  tradeManagement: TradeManagementSchema.optional(),

  // Exit rules
  exitRules: z.array(ExitRuleSchema).optional(),

  // News rules
  newsRules: NewsRuleSchema.optional(),

  // Pre-trade checklist
  checklist: z.array(ChecklistItemSchema).optional(),

  // Backtesting metrics
  backtestingMetrics: BacktestingMetricsSchema.optional(),

  // Notes
  notes: z.string().max(5000).optional(),
});

// Update strategy schema (all fields optional)
export const updateStrategySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),

  // Market selection
  markets: z.array(z.enum(MARKET_OPTIONS)).min(1).optional(),
  instruments: z.array(z.enum(INSTRUMENT_OPTIONS)).optional(),

  // Timeframes
  analysisTimeframe: z.enum(TIMEFRAME_OPTIONS).optional(),
  entryTimeframe: z.enum(TIMEFRAME_OPTIONS).optional(),

  // Market conditions
  conditions: z.array(z.enum(CONDITION_OPTIONS)).optional(),

  // Trading sessions
  sessions: z.array(z.enum(SESSION_OPTIONS)).optional(),

  // Entry rules
  entryRules: z.array(EntryRuleSchema).min(1).optional(),

  // Confirmations
  confirmations: z.array(ConfirmationSchema).optional(),

  // Risk management
  riskPercent: z.number().positive().max(100).optional(),
  maxDailyLoss: z.number().positive().max(100).optional(),
  maxDrawdown: z.number().positive().max(100).optional(),
  maxOpenTrades: z.number().int().positive().optional(),
  maxDailyTrades: z.number().int().positive().optional(),

  // Stop loss
  stopLoss: StopLossSchema.optional(),

  // Take profit
  tpTargets: z.array(TpTargetSchema).optional(),

  // Trade management
  tradeManagement: TradeManagementSchema.optional(),

  // Exit rules
  exitRules: z.array(ExitRuleSchema).optional(),

  // News rules
  newsRules: NewsRuleSchema.optional(),

  // Pre-trade checklist
  checklist: z.array(ChecklistItemSchema).optional(),

  // Backtesting metrics
  backtestingMetrics: BacktestingMetricsSchema.optional(),

  // Notes
  notes: z.string().max(5000).optional(),
});

// Validation helpers
export function validateRiskLimits(data: z.infer<typeof createStrategySchema>): string[] {
  const errors: string[] = [];

  if (data.riskPercent > 5) {
    errors.push("Risk percent should not exceed 5% per trade for professional trading");
  }

  if (data.maxDailyLoss && data.maxDailyLoss < data.riskPercent * 2) {
    errors.push("Max daily loss should be at least 2x your risk per trade");
  }

  if (data.maxDrawdown && data.maxDrawdown < 10) {
    errors.push("Max drawdown limit should be at least 10%");
  }

  return errors;
}

export function validateTimeframes(data: z.infer<typeof createStrategySchema>): string[] {
  const errors: string[] = [];

  if (data.analysisTimeframe && data.entryTimeframe) {
    const tfOrder = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];
    const analysisIdx = tfOrder.indexOf(data.analysisTimeframe);
    const entryIdx = tfOrder.indexOf(data.entryTimeframe);

    if (entryIdx > analysisIdx) {
      errors.push("Entry timeframe should be equal to or lower than analysis timeframe");
    }
  }

  return errors;
}

export function validateRiskReward(data: z.infer<typeof createStrategySchema>): string[] {
  const errors: string[] = [];

  if (data.tpTargets) {
    const hasValidRR = data.tpTargets.some(
      tp => tp.riskReward && tp.riskReward >= 1
    );

    if (!hasValidRR) {
      errors.push("At least one take profit target should have risk/reward ratio >= 1:1");
    }
  }

  return errors;
}

export function validateChecklist(data: z.infer<typeof createStrategySchema>): string[] {
  const errors: string[] = [];

  if (data.checklist && data.checklist.length > 0) {
    const hasRequired = data.checklist.some(item => item.required);
    if (!hasRequired) {
      errors.push("At least one checklist item should be marked as required");
    }
  }

  return errors;
}
