import { useState } from "react";
import { pnlRanges } from "../helpers/contants.js";
import {
  buildPnlSeries,
  formatMoney,
  formatPercent,
  formatProfitFactor,
  getRangeDescription,
  shouldShowDateLabel,
} from "../helpers/utils.js";
import { useAccountMetrics, useDailyPnL } from "../hooks/useAnalytics.js";
import { IAnalyticsProps } from "../types/analytics.types.js";
import styles from "./Analytics.module.scss";

const Analytics = ({ accountId }: IAnalyticsProps) => {
  const [selectedRange, setSelectedRange] = useState<
    (typeof pnlRanges)[number]
  >(pnlRanges[2]);
  const { data: metrics, isLoading: metricsLoading } =
    useAccountMetrics(accountId);
  const { data: dailyPnLData, isLoading: pnlLoading } = useDailyPnL(
    accountId,
    selectedRange.days,
  );

  if (metricsLoading || pnlLoading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  if (!metrics || !dailyPnLData) {
    return <div className={styles.error}>Failed to load analytics</div>;
  }

  const dailyPnL = buildPnlSeries(dailyPnLData, selectedRange.days);
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

  return (
    <div className={styles["strategy-performance"]}>
      <div className={styles["metrics-grid"]}>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Total Trades</span>
          <span className={styles.value}>{metrics.totalTrades}</span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Win Rate</span>
          <span className={styles.value}>
            {(metrics.winRate ?? 0).toFixed(1)}%
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Wins/Losses</span>
          <span className={styles.value}>
            {metrics.totalWinningTrades}/{metrics.totalLosingTrades}
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Total Profit</span>
          <span className={`${styles.value} ${styles.positive}`}>
            {formatMoney(metrics.totalProfit)}
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Total Loss</span>
          <span className={`${styles.value} ${styles.negative}`}>
            {formatMoney(metrics.totalLoss)}
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Profit Factor</span>
          <span className={styles.value}>
            {formatProfitFactor(metrics.profitFactor)}
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Max Drawdown</span>
          <span className={`${styles.value} ${styles.negative}`}>
            {formatPercent(metrics.maxDrawdown)}
          </span>
        </div>
        <div className={styles["metric-card"]}>
          <span className={styles.label}>Avg Win/Loss</span>
          <span className={styles.value}>
            {formatMoney(metrics.averageWin)} /{" "}
            {formatMoney(metrics.averageLoss)}
          </span>
        </div>
      </div>

      <div className={styles["pnl-history"]}>
        <div className={styles["pnl-header"]}>
          <div>
            <span className={styles["section-kicker"]}>
              Portfolio performance
            </span>
            <h3>Daily P&L</h3>
            <p>
              {getRangeDescription(selectedRange.days)} of account performance
            </p>
          </div>
          <div
            className={styles["pnl-range-switcher"]}
            aria-label="Daily P&L range"
          >
            {pnlRanges.map((range) => (
              <button
                key={range.label}
                className={
                  selectedRange.days === range.days ? styles.active : undefined
                }
                onClick={() => setSelectedRange(range)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div
            className={`${styles["pnl-total-card"]} ${
              totalDailyPnL >= 0 ? styles.positive : styles.negative
            }`}
          >
            <span>Total P&L</span>
            <strong>{formatMoney(totalDailyPnL)}</strong>
          </div>
        </div>

        <div className={styles["pnl-summary-row"]}>
          <div>
            <span>Profitable days</span>
            <strong className={styles.positive}>{positiveDays}</strong>
          </div>
          <div>
            <span>Losing days</span>
            <strong className={styles.negative}>{negativeDays}</strong>
          </div>
          <div>
            <span>Best day</span>
            <strong className={styles.positive}>
              {formatMoney(bestDay?.pnl)}
            </strong>
          </div>
          <div>
            <span>Worst day</span>
            <strong className={styles.negative}>
              {formatMoney(worstDay?.pnl)}
            </strong>
          </div>
        </div>

        <div className={`${styles["pnl-chart"]} ${styles["etoro-style"]}`}>
          {dailyPnL.length === 0 ? (
            <p className={styles.empty}>No P&L data available</p>
          ) : (
            <>
              <div className={styles["zero-line"]} />
              <div className={styles["chart-bars"]}>
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
                    <div className={styles["pnl-day"]} key={day.date}>
                      <div className={styles["bar-track"]}>
                        <div
                          className={`${styles.bar} ${
                            day.pnl >= 0 ? styles.positive : styles.negative
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
};

export default Analytics;
