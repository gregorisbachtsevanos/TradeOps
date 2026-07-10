import { metricCards } from "../../helpers/utils";
import { IAnalyticsMetrics } from "../../types/analytics.types";
import styles from "./Metrics.module.scss";

const Metrics = ({ metrics }: { metrics: NoInfer<IAnalyticsMetrics> }) => {
  return (
    <div className={styles["metrics-grid"]}>
      {metricCards(metrics).map(([label, value]) => (
        <div className={styles["metric-card"]} key={label}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      ))}
    </div>
  );
};

export default Metrics;
