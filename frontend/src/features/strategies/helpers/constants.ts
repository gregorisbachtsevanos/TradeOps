export const MARKET_OPTIONS = [
  "forex",
  "crypto",
  "stocks",
  "indices",
  "commodities",
  "bonds",
];

export const INSTRUMENT_OPTIONS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "USDCHF",
  "BTCUSD",
  "ETHUSD",
  "XAUUSD",
  "US30",
  "NAS100",
  "SPX500",
  "UK100",
];

export const TIMEFRAME_OPTIONS = [
  "M1",
  "M5",
  "M15",
  "M30",
  "H1",
  "H4",
  "D1",
  "W1",
  "MN",
];

export const CONDITION_OPTIONS = [
  "trending_bullish",
  "trending_bearish",
  "ranging",
  "breakout",
  "high_volatility",
  "low_volatility",
  "news_driven",
];

export const SESSION_OPTIONS = [
  "london",
  "new_york",
  "sydney",
  "tokyo",
  "london_new_york_overlap",
];

export const ENTRY_RULE_TYPES = [
  "price_action",
  "indicator",
  "pattern",
  "level",
  "custom",
];

export const CONFIRMATION_TYPES = [
  "indicator",
  "price_action",
  "volume",
  "time",
  "pattern",
  "custom",
];

export const STOP_LOSS_TYPES = [
  "atr",
  "percentage",
  "pivot",
  "structure",
  "fixed_pips",
  "custom",
];

export const TP_TYPES = [
  "atr",
  "percentage",
  "pivot",
  "structure",
  "fixed_pips",
  "risk_reward",
  "custom",
];

export const STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "markets", label: "Markets" },
  { id: "entry", label: "Entry Rules" },
  { id: "risk", label: "Risk Management" },
  { id: "exit", label: "Exit Rules" },
  { id: "checklist", label: "Checklist" },
] as const;

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rules", label: "Rules" },
  { id: "risk", label: "Risk" },
  { id: "performance", label: "Performance" },
] as const;
