import { useAccountInfo } from "../../../Dashboard/hooks/useAccount.js";
import { IRiskPanelProps } from "../../types/overview.types.js";
import styles from "./RiskPanel.module.scss";

const RiskPanel = ({ accountId }: IRiskPanelProps) => {
  const { data: info, isLoading } = useAccountInfo(accountId);

  if (isLoading) {
    return <div className={styles.loading}>Loading risk data...</div>;
  }

  if (!info) {
    return <div className={styles.error}>Failed to load risk data</div>;
  }

  const maxExposure = info.balance * 0.5;
  const exposurePercent = (info.exposure / maxExposure) * 100;
  const riskColor =
    exposurePercent > 80
      ? "#ff4757"
      : exposurePercent > 60
        ? "#ffa502"
        : "#2ed573";

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
          <span className={styles.value} style={{ color: riskColor }}>
            {exposurePercent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className={styles["risk-bar"]}>
        <div
          className={styles["risk-fill"]}
          style={{
            width: `${Math.min(exposurePercent, 100)}%`,
            backgroundColor: riskColor,
          }}
        />
      </div>
      <p className={styles["risk-note"]}>Max Exposure: ${maxExposure.toFixed(2)}</p>
    </div>
  );
};

export default RiskPanel;
