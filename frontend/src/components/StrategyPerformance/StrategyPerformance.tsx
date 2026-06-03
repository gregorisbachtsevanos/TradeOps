import { useState } from "react";
import { useAccountMetrics, useDailyPnL } from "../../hooks/useApi.js";
import { DailyPnL } from "../../types/index.js";
import "./StrategyPerformance.css";

const pnlRanges = [
  { label: "Daily", days: 1 },
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

interface StrategyPerformanceProps {
  accountId: string;
}

function StrategyPerformance({ accountId }: StrategyPerformanceProps) {
  const [selectedRange, setSelectedRange] = useState<(typeof pnlRanges)[number]>(
    pnlRanges[2],
  );
  const { data: metricsResponse, isLoading: metricsLoading } =
    useAccountMetrics(accountId);
  const { data: pnlResponse, isLoading: pnlLoading } = useDailyPnL(
    accountId,
    selectedRange.days,
  );

  if (metricsLoading || pnlLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!metricsResponse?.data || !pnlResponse?.data) {
    return <div className="error">Failed to load analytics</div>;
  }

  const metrics = metricsResponse.data;
  const dailyPnL = buildPnlSeries(
    pnlResponse.data.dailyPnL || [],
    selectedRange.days,
  );
  const totalDailyPnL = dailyPnL.reduce((sum, day) => sum + day.pnl, 0);
  const positiveDays = dailyPnL.filter((day) => day.pnl > 0).length;
  const negativeDays = dailyPnL.filter((day) => day.pnl < 0).length;
  const bestDay = dailyPnL.reduce(
    (best, day) => (day.pnl > best.pnl ? day : best),
    dailyPnL[0],
  );
  const worstDay = dailyPnL.reduce(
    (worst, day) => (day.pnl < worst.pnl ? day : worst),
    dailyPnL[0],
  );
  const maxPnL = Math.max(...dailyPnL.map((day) => Math.abs(day.pnl)), 1);
  const formatMoney = (value: number | null | undefined) =>
    `$${(value ?? 0).toFixed(2)}`;
  const formatPercent = (value: number | null | undefined) =>
    `${(value ?? 0).toFixed(2)}%`;
  const formatProfitFactor = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toFixed(2)
      : "N/A";

  return (
    <div className="strategy-performance">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="label">Total Trades</span>
          <span className="value">{metrics.totalTrades}</span>
        </div>
        <div className="metric-card">
          <span className="label">Win Rate</span>
          <span className="value">{(metrics.winRate ?? 0).toFixed(1)}%</span>
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
            {formatMoney(metrics.totalProfit)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Total Loss</span>
          <span className="value negative">
            {formatMoney(metrics.totalLoss)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Profit Factor</span>
          <span className="value">
            {formatProfitFactor(metrics.profitFactor)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Max Drawdown</span>
          <span className="value negative">
            {formatPercent(metrics.maxDrawdown)}
          </span>
        </div>
        <div className="metric-card">
          <span className="label">Avg Win/Loss</span>
          <span className="value">
            {formatMoney(metrics.averageWin)} /{" "}
            {formatMoney(metrics.averageLoss)}
          </span>
        </div>
      </div>

      <div className="pnl-history">
        <div className="pnl-header">
          <div>
            <span className="section-kicker">Portfolio performance</span>
            <h3>Daily P&L</h3>
            <p>{getRangeDescription(selectedRange.days)} of account performance</p>
          </div>
          <div className="pnl-range-switcher" aria-label="Daily P&L range">
            {pnlRanges.map((range) => (
              <button
                key={range.label}
                className={
                  selectedRange.days === range.days ? "active" : undefined
                }
                onClick={() => setSelectedRange(range)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div
            className={`pnl-total-card ${
              totalDailyPnL >= 0 ? "positive" : "negative"
            }`}
          >
            <span>Total P&L</span>
            <strong>{formatMoney(totalDailyPnL)}</strong>
          </div>
        </div>

        <div className="pnl-summary-row">
          <div>
            <span>Profitable days</span>
            <strong className="positive">{positiveDays}</strong>
          </div>
          <div>
            <span>Losing days</span>
            <strong className="negative">{negativeDays}</strong>
          </div>
          <div>
            <span>Best day</span>
            <strong className="positive">{formatMoney(bestDay?.pnl)}</strong>
          </div>
          <div>
            <span>Worst day</span>
            <strong className="negative">{formatMoney(worstDay?.pnl)}</strong>
          </div>
        </div>

        <div className="pnl-chart etoro-style">
          {dailyPnL.length === 0 ? (
            <p className="empty">No P&L data available</p>
          ) : (
            <>
              <div className="zero-line" />
              <div className="chart-bars">
                {dailyPnL.map((day, index) => {
                  const height =
                    day.pnl === 0
                      ? 3
                      : Math.max((Math.abs(day.pnl) / maxPnL) * 44, 6);
                  const dateLabel = new Date(day.date).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                    },
                  );

                  return (
                    <div className="pnl-day" key={day.date}>
                      <div className="bar-track">
                        <div
                          className={`bar ${
                            day.pnl >= 0 ? "positive" : "negative"
                          }`}
                          title={`${dateLabel}: ${formatMoney(day.pnl)}`}
                          style={{
                            height: `${height}%`,
                            [day.pnl >= 0 ? "bottom" : "top"]: "50%",
                          }}
                        />
                      </div>
                      {shouldShowDateLabel(index, dailyPnL.length) && (
                        <span>{dateLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const buildPnlSeries = (days: DailyPnL[], rangeDays: number) => {
  const pnlByDate = new Map(days.map((day) => [day.date, day.pnl]));
  const today = new Date();

  return Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (rangeDays - 1 - index));
    const key = date.toISOString().split("T")[0];

    return {
      date: key,
      pnl: pnlByDate.get(key) ?? 0,
      trades: days.find((day) => day.date === key)?.trades ?? 0,
    };
  });
};

const getRangeDescription = (days: number) => {
  if (days === 1) return "Today";
  if (days === 7) return "Last 7 days";
  if (days === 30) return "Last 30 days";
  if (days === 90) return "Last 3 months";
  if (days === 180) return "Last 6 months";
  return "Last 1 year";
};

const shouldShowDateLabel = (index: number, total: number) => {
  if (total <= 7) return true;
  if (total <= 30) return index % 6 === 0;
  if (total <= 90) return index % 15 === 0;
  if (total <= 180) return index % 30 === 0;
  return index % 60 === 0;
};

export default StrategyPerformance;
