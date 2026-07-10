import { useAccountInfo } from "@/features/Dashboard/hooks/useAccount";
import { ErrorGuard, LoaderGuard } from "@/features/Guard/Guard";
import { IEquityProps } from "../../types/overview.types";
import styles from "./Equity.module.scss";

function Equity({ accountId }: IEquityProps) {
  const { data: info, isLoading } = useAccountInfo(accountId);

  if (isLoading) return <LoaderGuard />;

  if (!info) return <ErrorGuard text="Failed to load account info" />;

  const returnPercent = ((info.equity - info.balance) / info.balance) * 100;

  return (
    <div className={styles["equity-overview"]}>
      <h3>Account Overview</h3>
      <div className={styles["equity-grid"]}>
        <div className={styles["equity-item"]}>
          <span className={styles.label}>Balance</span>
          <span className={styles.value}>${info.balance.toFixed(2)}</span>
        </div>
        <div className={styles["equity-item"]}>
          <span className={styles.label}>Equity</span>
          <span className={styles.value}>${info.equity.toFixed(2)}</span>
        </div>
        <div className={styles["equity-item"]}>
          <span className={styles.label}>Daily P&L</span>
          <span
            className={`${styles.value} ${info.dailyPnL >= 0 ? styles.positive : styles.negative}`}
          >
            ${info.dailyPnL.toFixed(2)}
          </span>
        </div>
        <div className={styles["equity-item"]}>
          <span className={styles.label}>Return %</span>
          <span
            className={`${styles.value} ${returnPercent >= 0 ? styles.positive : styles.negative}`}
          >
            {returnPercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default Equity;
