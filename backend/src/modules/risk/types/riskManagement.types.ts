export interface IRiskManagementRules {
  maxDailyLossPercent: number;
  maxOpenTrades: number;
  positionRiskPercent: number;
}

export interface IRiskCheckResult {
  allowed: boolean;
  reason?: string;
  availableExposure?: number;
  currentExposure?: number;
}
