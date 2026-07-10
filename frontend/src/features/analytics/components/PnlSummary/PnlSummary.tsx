import { formatMoney } from "../../helpers/utils";
import { IPnl } from "../../types/analytics.types";
import styles from "./PnlSummary.module.scss";

const PnlSummary = ({ pnlStats }: { pnlStats: IPnl["pnlStats"] }) => {
  return (
    <div className={styles["pnl-summary-row"]}>
      <div>
        <span>Profitable days</span>
        <strong className={styles.positive}>{pnlStats.positiveDays}</strong>
      </div>

      <div>
        <span>Losing days</span>
        <strong className={styles.negative}>{pnlStats.negativeDays}</strong>
      </div>

      <div>
        <span>Best day</span>
        <strong className={styles.positive}>
          {formatMoney(pnlStats.bestDay?.pnl)}
        </strong>
      </div>

      <div>
        <span>Worst day</span>
        <strong className={styles.negative}>
          {formatMoney(pnlStats.worstDay?.pnl)}
        </strong>
      </div>
    </div>
  );
};

export default PnlSummary;
