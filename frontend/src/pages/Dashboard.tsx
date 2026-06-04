import { useEffect, useState } from "react";
import AccountSelector from "../components/AccountSelector/AccountSelector.js";
import ChartWorkspace from "../components/ChartWorkspace/ChartWorkspace.js";
import EquityOverview from "../components/EquityOverview/EquityOverview.js";
import KpiStrip from "../components/KpiStrip/KpiStrip.js";
import LiveTradesTable from "../components/LiveTradesTable/LiveTradesTable.js";
import RiskPanel from "../components/RiskPanel/RiskPanel.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import StrategyPerformance from "../components/StrategyPerformance/StrategyPerformance.js";
import { useAccounts, useCreateAccount } from "../hooks/useApi.js";
import { useStore } from "../hooks/useStore.js";
import "./Dashboard.css";

interface DashboardProps {
  theme: "dark" | "light";
}

function Dashboard({ theme }: DashboardProps) {
  const { selectedAccountId, setSelectedAccountId } = useStore();
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts();
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
    const suffix = Math.floor(100 + Math.random() * 900);
    const response = await createAccount.mutateAsync({
      externalId: `MT5-DEMO-${suffix}`,
      balance: 25000,
      equity: 25240,
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
            <p className="eyebrow">Trading workspace</p>
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
            <p>Create or select an account to view data</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
