import { useEffect, useState } from "react";
import { useAccountInfo } from "../hooks/useAccount.js";
import { IKpiStripProps } from "../types/dashboard.types.js";

const KpiStrip = ({ accountId }: IKpiStripProps) => {
  const { data: info, isLoading } = useAccountInfo(accountId || "");
  const [liveDelta, setLiveDelta] = useState(0);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextDelta = (Math.random() - 0.48) * 140;
      setLiveDelta((currentDelta) => currentDelta + nextDelta);
      setFlashDirection(nextDelta >= 0 ? "up" : "down");
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  const liveEquity = info ? info.equity + liveDelta : undefined;
  const pnl = (info?.dailyPnL ?? 0) + liveDelta * 0.18;
  const returnPercent =
    info && info.balance > 0
      ? (((liveEquity ?? info.equity) - info.balance) / info.balance) * 100
      : 0;

  const formatMoney = (value: number | undefined) =>
    isLoading
      ? "Loading..."
      : `$${(value ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <section
      className="kpi-strip"
      aria-label="Account key performance indicators"
    >
      <div className="kpi-card">
        <span>Balance</span>
        <strong>{formatMoney(info?.balance)}</strong>
      </div>
      <div className={`kpi-card live-flash ${flashDirection}`}>
        <span>Equity</span>
        <strong>{formatMoney(liveEquity)}</strong>
      </div>
      <div className={`kpi-card live-flash ${flashDirection}`}>
        <span>Daily P&L</span>
        <strong className={pnl >= 0 ? "positive" : "negative"}>
          {formatMoney(pnl)}
        </strong>
      </div>
      <div className={`kpi-card live-flash ${flashDirection}`}>
        <span>Return</span>
        <strong className={returnPercent >= 0 ? "positive" : "negative"}>
          {isLoading ? "Loading..." : `${returnPercent.toFixed(2)}%`}
        </strong>
      </div>
    </section>
  );
};

export default KpiStrip;
