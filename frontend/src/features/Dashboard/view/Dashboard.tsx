import Overview from "@/features/overview/view/Overview.js";
import { useEffect, useState } from "react";
import { useAccounts, useCreateAccount } from "../hooks/useAccount.js";

import { useStore } from "../../../app/hooks/useStore.js";
import Analytics from "../../analytics/index.js";
import Trades from "../../trades/index.js";

import { AccountSelector, KpiStrip, Sidebar } from "../";
import { IDashboardProps } from "../types/dashboard.types.js";
import "./Dashboard.css";

const Dashboard = ({ theme }: IDashboardProps) => {
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
              <Overview theme={theme} selectedAccountId={selectedAccountId} />
            )}

            {activeTab === "trades" && <Trades accountId={selectedAccountId} />}

            {activeTab === "analytics" && (
              <Analytics accountId={selectedAccountId} />
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
};

export default Dashboard;
