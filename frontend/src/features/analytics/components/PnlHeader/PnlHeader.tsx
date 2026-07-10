import { pnlRanges } from "../../helpers/contants";
import { formatMoney, getRangeDescription } from "../../helpers/utils";
import { IPnl } from "../../types/analytics.types";
import styles from "./PnlHeader.module.scss";

const PnlHeader = ({ selectedRange, pnlStats, handleRangeChange }: IPnl) => {
  return (
    <div className={styles["pnl-header"]}>
      <div>
        <span className={styles["section-kicker"]}>Portfolio performance</span>
        <h3>Daily P&L</h3>
        <p>{getRangeDescription(selectedRange.days)} of account performance</p>
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
            onClick={() => handleRangeChange(range)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div
        className={`${styles["pnl-total-card"]} ${
          pnlStats.total >= 0 ? styles.positive : styles.negative
        }`}
      >
        <span>Total P&L</span>
        <strong>{formatMoney(pnlStats.total)}</strong>
      </div>
    </div>
  );
};

export default PnlHeader;
