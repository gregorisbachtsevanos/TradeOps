import { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore.js";
import { useAccounts, useCreateAccount } from "../hooks/useApi.js";
import AccountSelector from "../features/AccountSelector.js";
import LiveTradesTable from "../features/LiveTradesTable.js";
import EquityOverview from "../features/EquityOverview.js";
import RiskPanel from "../features/RiskPanel.js";
import StrategyPerformance from "../features/StrategyPerformance.js";
import Sidebar from "../features/Sidebar.js";
import KpiStrip from "../features/KpiStrip.js";
import TradingViewChart from "../features/TradingViewChart.js";
import "./Dashboard.css";
import ChartWorkspace from "../features/ChartWorkspace.js";

interface DashboardProps {
  theme: "dark" | "light";
}

function Dashboard({ theme }: DashboardProps) {
  const { user, selectedAccountId, setSelectedAccountId } = useStore();
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts(
    user?.id || "",
  );
  const createAccount = useCreateAccount();
  const [activeTab, setActiveTab] = useState<
    "overview" | "trades" | "analytics"
  >("overview");

  const accounts = accountsResponse?.data?.accounts;
  const accountIds = accounts?.map((account) => account.id).join("|") || "";
  const firstAccountId = accounts?.[0]?.id;

  useEffect(() => {
    if (!accountsResponse?.data) {
      return;
    }

    if (!accounts || accounts.length === 0) {
      if (selectedAccountId !== null) {
        setSelectedAccountId(null);
      }
      return;
    }

    const selectedAccountExists = accounts.some(
      (account) => account.id === selectedAccountId,
    );

    if (!selectedAccountId || !selectedAccountExists) {
      setSelectedAccountId(firstAccountId || null);
    }
  }, [
    accountIds,
    accounts,
    accountsResponse?.data,
    firstAccountId,
    selectedAccountId,
    setSelectedAccountId,
  ]);

  if (accountsLoading) {
    return <div className="loading">Loading accounts...</div>;
  }

  if (!accountsResponse?.data) {
    return <div className="error">Failed to load accounts</div>;
  }

  const handleCreateDemoAccount = async () => {
    if (!user?.id) return;

    const suffix = Math.floor(100 + Math.random() * 900);
    const response = await createAccount.mutateAsync({
      userId: user.id,
      data: {
        externalId: `MT5-DEMO-${suffix}`,
        balance: 25000,
        equity: 25240,
      },
    });

    if (response.data?.id) {
      setSelectedAccountId(response.data.id);
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Demo trading workspace</p>
            <h2>Portfolio Command Center</h2>
          </div>
          <AccountSelector
            accounts={accounts || []}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
            onCreateDemoAccount={handleCreateDemoAccount}
            isCreating={createAccount.isLoading}
          />
        </div>

        <KpiStrip accountId={selectedAccountId} />

        {selectedAccountId ? (
          <div className="dashboard-content">
            {activeTab === "overview" && (
              <>
                <ChartWorkspace accountId={selectedAccountId} theme={theme} />
                {/* <TradingViewChart accountId={selectedAccountId} theme={theme} /> */}
                <div className="overview-grid">
                  <EquityOverview accountId={selectedAccountId} />
                  <RiskPanel accountId={selectedAccountId} />
                </div>
              </>
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
      </main>
    </div>
  );
}

export default Dashboard;
