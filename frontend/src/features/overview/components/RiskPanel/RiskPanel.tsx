import { ErrorGuard, LoaderGuard } from "@/features/Guard/Guard.js";
import { useAccountInfo } from "../../../Dashboard/hooks/useAccount.js";
import { IRiskPanelProps } from "../../types/overview.types.js";
import styles from "./RiskPanel.module.scss";

const RiskPanel = ({ accountId }: IRiskPanelProps) => {
  const { data: info, isLoading } = useAccountInfo(accountId);

  if (isLoading) return <LoaderGuard />;

  if (!info) return <ErrorGuard text="Failed to load risk data" />;

  const maxExposure = info.balance * 0.5;
  const exposurePercent = (info.exposure / maxExposure) * 100;

  // CSS class-based risk colour — no inline styles
  const riskLevel =
    exposurePercent > 80 ? "high" : exposurePercent > 60 ? "mid" : "low";

  return (
    <div className={styles["risk-panel"]}>
      <h3>Risk Status</h3>
      <div className={styles["risk-metrics"]}>
        <div className={styles.metric}>
          <span className={styles.label}>Open Trades</span>
          <span className={styles.value}>{info.openTrades}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Exposure</span>
          <span className={styles.value}>${info.exposure.toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Exposure %</span>
          <span className={`${styles.value} ${styles[`risk-${riskLevel}`]}`}>
            {exposurePercent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className={styles["risk-bar"]}>
        <div
          className={`${styles["risk-fill"]} ${styles[`risk-fill-${riskLevel}`]}`}
          style={{ width: `${Math.min(exposurePercent, 100)}%` }}
        />
      </div>
      <p className={styles["risk-note"]}>
        Max Exposure: ${maxExposure.toFixed(2)}
      </p>
    </div>
  );
};

export default RiskPanel;
