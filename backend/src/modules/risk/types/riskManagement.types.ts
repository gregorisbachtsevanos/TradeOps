export interface RiskManagementRules {
  maxDailyLossPercent: number;
  maxOpenTrades: number;
  positionRiskPercent: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  availableExposure?: number;
  currentExposure?: number;
}
