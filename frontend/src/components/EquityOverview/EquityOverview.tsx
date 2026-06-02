import { useAccountInfo } from "../../hooks/useApi.js";
import "./EquityOverview.css";

interface EquityOverviewProps {
  accountId: string;
}

function EquityOverview({ accountId }: EquityOverviewProps) {
  const { data: response, isLoading } = useAccountInfo(accountId);

  if (isLoading) {
    return <div className="loading">Loading account info...</div>;
  }

  if (!response?.data) {
    return <div className="error">Failed to load account info</div>;
  }

  const info = response.data;
  const returnPercent = ((info.equity - info.balance) / info.balance) * 100;

  return (
    <div className="equity-overview">
      <h3>Account Overview</h3>
      <div className="equity-grid">
        <div className="equity-item">
          <span className="label">Balance</span>
          <span className="value">${info.balance.toFixed(2)}</span>
        </div>
        <div className="equity-item">
          <span className="label">Equity</span>
          <span className="value">${info.equity.toFixed(2)}</span>
        </div>
        <div className="equity-item">
          <span className="label">Daily P&L</span>
          <span
            className={`value ${info.dailyPnL >= 0 ? "positive" : "negative"}`}
          >
            ${info.dailyPnL.toFixed(2)}
          </span>
        </div>
        <div className="equity-item">
          <span className="label">Return %</span>
          <span
            className={`value ${returnPercent >= 0 ? "positive" : "negative"}`}
          >
            {returnPercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default EquityOverview;
