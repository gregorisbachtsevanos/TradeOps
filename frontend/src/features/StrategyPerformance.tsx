import React from "react";
import { useAccountMetrics, useDailyPnL } from "../hooks/useApi.js";
import "./StrategyPerformance.css";

interface StrategyPerformanceProps {
  accountId: string;
}

function StrategyPerformance({ accountId }: StrategyPerformanceProps) {
  const { data: metricsResponse, isLoading: metricsLoading } =
    useAccountMetrics(accountId);
  const { data: pnlResponse, isLoading: pnlLoading } = useDailyPnL(
    accountId,
    30,
  );

  if (metricsLoading || pnlLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!metricsResponse?.data || !pnlResponse?.data) {
    return <div className="error">Failed to load analytics</div>;
  }

  const metrics = metricsResponse.data;
  const dailyPnL = pnlResponse.data.dailyPnL || [];

  return (
    <div className="strategy-performance">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="label">Total Trades</span>
          <span className="value">{metrics.totalTrades}</span>
        </div>
        <div className="metric-card">
          <span className="label">Win Rate</span>
          <span className="value">{metrics.winRate.toFixed(1)}%</span>
        </div>
        <div className="metric-card">
          <span className="label">Wins/Losses</span>
          <span className="value">
            {metrics.totalWinningTrades}/{metrics.totalLosingTrades}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Total Profit</span>
          <span className="value positive">
            ${metrics.totalProfit.toFixed(2)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Total Loss</span>
          <span className="value negative">
            ${metrics.totalLoss.toFixed(2)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Profit Factor</span>
          <span className="value">
            {isFinite(metrics.profitFactor)
              ? metrics.profitFactor.toFixed(2)
              : "N/A"}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Max Drawdown</span>
          <span className="value negative">
            {metrics.maxDrawdown.toFixed(2)}%
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Avg Win/Loss</span>
          <span className="value">
            ${metrics.averageWin.toFixed(2)} / ${metrics.averageLoss.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pnl-history">
        <h3>Daily P&L (Last 30 Days)</h3>
        <div className="pnl-chart">
          {dailyPnL.length === 0 ? (
            <p className="empty">No P&L data available</p>
          ) : (
            <div className="chart-bars">
              {dailyPnL.map((day) => {
                const maxPnL = Math.max(
                  ...dailyPnL.map((d) => Math.abs(d.pnl)),
                );
                const height = (Math.abs(day.pnl) / maxPnL) * 100;
                return (
                  <div
                    key={day.date}
                    className="bar"
                    title={`${day.date}: $${day.pnl.toFixed(2)}`}
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: day.pnl >= 0 ? "#2ed573" : "#ff4757",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StrategyPerformance;
