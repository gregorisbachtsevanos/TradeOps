import { useAccountInfo } from "../hooks/useApi.js";

interface KpiStripProps {
  accountId: string | null;
}

function KpiStrip({ accountId }: KpiStripProps) {
  const { data: response, isLoading } = useAccountInfo(accountId || "");
  const info = response?.data;
  const pnl = info?.dailyPnL ?? 0;
  const returnPercent =
    info && info.balance > 0 ? ((info.equity - info.balance) / info.balance) * 100 : 0;

  const formatMoney = (value: number | undefined) =>
    isLoading ? "Loading..." : `$${(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="kpi-strip" aria-label="Account key performance indicators">
      <div className="kpi-card">
        <span>Balance</span>
        <strong>{formatMoney(info?.balance)}</strong>
      </div>
      <div className="kpi-card">
        <span>Equity</span>
        <strong>{formatMoney(info?.equity)}</strong>
      </div>
      <div className="kpi-card">
        <span>Daily P&L</span>
        <strong className={pnl >= 0 ? "positive" : "negative"}>
          {formatMoney(pnl)}
        </strong>
      </div>
      <div className="kpi-card">
        <span>Return</span>
        <strong className={returnPercent >= 0 ? "positive" : "negative"}>
          {isLoading ? "Loading..." : `${returnPercent.toFixed(2)}%`}
        </strong>
      </div>
    </section>
  );
}

export default KpiStrip;
