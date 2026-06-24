import { ITradingViewChartProps } from "../types/overview.types";
import styles from "../../Dashboard/view/Dashboard.module.css";

const TradingViewChart = ({ params }: ITradingViewChartProps) => {
  return (
    <section className={`${styles["tradingview-panel"]} ${styles.embedded}`}>
      <iframe
        title="TradingView advanced chart"
        src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
        className={styles["tradingview-frame"]}
        allowFullScreen
      />
    </section>
  );
};

export default TradingViewChart;
