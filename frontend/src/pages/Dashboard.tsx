import { useEffect, useState } from "react";
import AccountSelector from "../features/AccountSelector";
import ChartWorkspace from "../features/ChartWorkspace/";
import EquityOverview from "../features/EquityOverview/";
import KpiStrip from "../features/KpiStrip/";
import LiveTradesTable from "../features/LiveTradesTable/";
import RiskPanel from "../features/RiskPanel/";
import Sidebar from "../features/Sidebar/";
import StrategyPerformance from "../features/StrategyPerformance/";
import { useAccounts, useCreateAccount } from "../hooks/accounts/index.js";
import { useStore } from "../hooks/useStore.js";
import "./Dashboard.css";

interface DashboardProps {
  theme: "dark" | "light";
}

function Dashboard({ theme }: DashboardProps) {
  const { selectedAccountId, setSelectedAccountId } = useStore();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const [activeTab, setActiveTab] = useState<
    "overview" | "trades" | "analytics"
  >("overview");

  const accountIds = accounts?.map((account) => account.id).join("|") || "";
  const firstAccountId = accounts?.[0]?.id;

  useEffect(() => {
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
    firstAccountId,
    selectedAccountId,
    setSelectedAccountId,
  ]);

  if (accountsLoading) {
    return <div className="loading">Loading accounts...</div>;
  }

  if (!accounts) {
    return <div className="error">Failed to load accounts</div>;
  }

  const handleCreateDemoAccount = async () => {
    const suffix = Math.floor(100 + Math.random() * 900);
    const newAccount = await createAccount.mutateAsync({
      externalId: `MT5-DEMO-${suffix}`,
      balance: 25000,
      equity: 25240,
    });

    if (newAccount?.data?.id) {
      setSelectedAccountId(newAccount.data.id);
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
            accounts={accounts}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
            onCreateDemoAccount={handleCreateDemoAccount}
            isCreating={createAccount.isPending}
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
