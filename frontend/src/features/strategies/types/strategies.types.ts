import { STEPS, TABS } from "../helpers/constants";

export interface IStrategiesProps {
  selectedAccountId: string;
}

export interface IStrategyWizardProps {
  strategy: Partial<IStrategy> | null;
  onSubmit: (data: Partial<IStrategy>) => void;
  onClose: () => void;
}

export type TStepId = (typeof STEPS)[number]["id"];

export interface IStrategy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  version?: number;
  createdAt: string;
  _count?: {
    trades: number;
    signals: number;
  };
  // Market selection
  markets?: string[];
  instruments?: string[];
  analysisTimeframe?: string;
  entryTimeframe?: string;
  // Market conditions
  conditions?: string[];
  // Trading sessions
  sessions?: string[];
  entryRules?: IEntryRule[];
  confirmations?: IConfirmation[];
  riskPercent?: number;
  maxDailyLoss?: number;
  maxDrawdown?: number;
  maxOpenTrades?: number;
  maxDailyTrades?: number;
  stopLoss?: IStopLoss;
  tpTargets?: ITpTarget[];
  tradeManagement?: ITradeManagement;
  exitRules?: IExitRule[];
  newsRules?: INewsRules;
  // Pre-trade checklist
  checklist?: IChecklistItem[];
  backtestingMetrics?: IBacktestingMetrics;
  notes?: string;
}

export interface IEntryRule {
  id?: string;
  type: "price_action" | "indicator" | "pattern" | "level" | "custom";
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  required?: boolean;
}

export interface IConfirmation {
  id?: string;
  type: "indicator" | "price_action" | "volume" | "time" | "pattern" | "custom";
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  required?: boolean;
}

export interface IStopLoss {
  type: "atr" | "percentage" | "pivot" | "structure" | "fixed_pips" | "custom";
  value?: number;
  atrMultiplier?: number;
  percentage?: number;
  pivotLevel?: string;
  structureLevel?: string;
  fixedPips?: number;
  description?: string;
}

export interface ITpTarget {
  id?: string;
  type:
    | "atr"
    | "percentage"
    | "pivot"
    | "structure"
    | "fixed_pips"
    | "risk_reward"
    | "custom";
  value?: number;
  atrMultiplier?: number;
  percentage?: number;
  pivotLevel?: string;
  structureLevel?: string;
  fixedPips?: number;
  riskReward?: number;
  partialPercent?: number;
  description?: string;
}

export interface ITradeManagement {
  breakevenTrigger?: number;
  breakevenPips?: number;
  trailingStop?: boolean;
  trailingStopPips?: number;
  trailingStopAt?: number;
  scaleIn?: boolean;
  scaleInRules?: any[];
  maxHoldTime?: number;
  description?: string;
}

export interface IExitRule {
  id?: string;
  type: "time_based" | "condition_based" | "pattern" | "indicator" | "custom";
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface IChecklistItem {
  id?: string;
  name: string;
  description?: string;
  required?: boolean;
}

export interface IBacktestingMetrics {
  totalTrades?: number;
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
  profitFactor?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  avgRR?: number;
  description?: string;
}

export interface INewsRules {
  avoidHighImpact?: boolean;
  minutesBefore?: number;
  minutesAfter?: number;
  closeBeforeNews?: boolean;
  newsEvents?: string[];
  description?: string;
}

export type TTabId = (typeof TABS)[number]["id"];

export interface IDetailPanelProps {
  selectedStrategyId: string | null;
  activeTab: TTabId;
  handleChangeTab: (selectedTab: TTabId) => void;
}

export interface StrategyItemsProps {
  selectedStrategyId: string | null;
  handleEdit: (strategy: IStrategy) => void;
  handleDelete: (strategyId: string) => Promise<void>;
  handleSelectStrategy: (strategyId: string) => void;
}
