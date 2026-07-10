import { ITradingViewChartProps } from "../types/overview.types";
import styles from "../../Dashboard/view/Dashboard.module.scss";

const TradingViewChart = ({ params }: ITradingViewChartProps) => {
  // key on the theme value forces React to fully unmount+remount the iframe
  // whenever the theme changes, ensuring TradingView reloads with the new theme param.
  const theme = params.get("theme") ?? "dark";

  return (
    <section
      key={theme}
      className={`${styles["tradingview-panel"]} ${styles.embedded}`}
    >
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
