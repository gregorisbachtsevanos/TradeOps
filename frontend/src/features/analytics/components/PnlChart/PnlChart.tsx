import { EmptyGuard } from "@/features/Guard/Guard";
import { formatMoney, shouldShowDateLabel } from "../../helpers/utils";
import { IPnlChart } from "../../types/analytics.types";
import styles from "./PnlChart.module.scss";

const PnlChart = ({ chartData, pnlStats }: IPnlChart) => {
  return (
    <div className={styles["pnl-chart"]}>
      {chartData.length === 0 ? (
        <EmptyGuard text="No P&L data available" />
      ) : (
        <>
          <div className={styles["zero-line"]} />

          <div className={styles["chart-bars"]}>
            {chartData.map((day, index) => {
              const height =
                day.pnl === 0
                  ? 3
                  : Math.max((Math.abs(day.pnl) / pnlStats.maxPnL) * 44, 6);

              return (
                <div className={styles["pnl-day"]} key={day.date}>
                  <div className={styles["bar-track"]}>
                    <div
                      className={`${styles.bar} ${
                        day.pnl >= 0 ? styles.positive : styles.negative
                      }`}
                      title={`${day.label}: ${formatMoney(day.pnl)}`}
                      style={{
                        height: `${height}%`,
                        bottom: day.pnl >= 0 ? "50%" : undefined,
                        top: day.pnl < 0 ? "50%" : undefined,
                      }}
                    />
                  </div>

                  {shouldShowDateLabel(index, chartData.length) && (
                    <span>{day.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PnlChart;
