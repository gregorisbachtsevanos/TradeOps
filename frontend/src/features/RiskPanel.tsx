import React from "react";
import { useAccountInfo } from "../hooks/useApi.js";
import "./RiskPanel.css";

interface RiskPanelProps {
  accountId: string;
}

function RiskPanel({ accountId }: RiskPanelProps) {
  const { data: response, isLoading } = useAccountInfo(accountId);

  if (isLoading) {
    return <div className="loading">Loading risk data...</div>;
  }

  if (!response?.data) {
    return <div className="error">Failed to load risk data</div>;
  }

  const info = response.data;
  const maxExposure = info.balance * 0.5; // 50% max exposure
  const exposurePercent = (info.exposure / maxExposure) * 100;
  const riskColor =
    exposurePercent > 80
      ? "#ff4757"
      : exposurePercent > 60
        ? "#ffa502"
        : "#2ed573";

  return (
    <div className="risk-panel">
      <h3>Risk Status</h3>
      <div className="risk-metrics">
        <div className="metric">
          <span className="label">Open Trades</span>
          <span className="value">{info.openTrades}</span>
        </div>
        <div className="metric">
          <span className="label">Exposure</span>
          <span className="value">${info.exposure.toFixed(2)}</span>
        </div>
        <div className="metric">
          <span className="label">Exposure %</span>
          <span className="value" style={{ color: riskColor }}>
            {exposurePercent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="risk-bar">
        <div
          className="risk-fill"
          style={{
            width: `${Math.min(exposurePercent, 100)}%`,
            backgroundColor: riskColor,
          }}
        />
      </div>
      <p className="risk-note">Max Exposure: ${maxExposure.toFixed(2)}</p>
    </div>
  );
}

export default RiskPanel;
