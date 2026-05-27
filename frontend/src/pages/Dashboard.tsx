import React, { useState } from "react";
import { useStore } from "../hooks/useStore.js";
import { useAccounts } from "../hooks/useApi.js";
import AccountSelector from "../features/AccountSelector.js";
import LiveTradesTable from "../features/LiveTradesTable.js";
import EquityOverview from "../features/EquityOverview.js";
import RiskPanel from "../features/RiskPanel.js";
import StrategyPerformance from "../features/StrategyPerformance.js";
import "./Dashboard.css";

function Dashboard() {
  const { user, selectedAccountId, setSelectedAccountId } = useStore();
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts(
    user?.id || "",
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "trades" | "analytics"
  >("overview");

  if (accountsLoading) {
    return <div className="loading">Loading accounts...</div>;
  }

  if (!accountsResponse?.data) {
    return <div className="error">Failed to load accounts</div>;
  }

  const accounts = accountsResponse.data.accounts || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <AccountSelector
          accounts={accounts}
          selectedId={selectedAccountId}
          onSelect={setSelectedAccountId}
        />
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "trades" ? "active" : ""}`}
          onClick={() => setActiveTab("trades")}
        >
          Live Trades
        </button>
        <button
          className={`tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {selectedAccountId ? (
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <div className="overview-grid">
              <EquityOverview accountId={selectedAccountId} />
              <RiskPanel accountId={selectedAccountId} />
            </div>
          )}

          {activeTab === "trades" && (
            <LiveTradesTable accountId={selectedAccountId} />
          )}

          {activeTab === "analytics" && (
            <StrategyPerformance accountId={selectedAccountId} />
          )}
        </div>
      ) : (
        <div className="placeholder">
          <p>Select an account to view data</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
