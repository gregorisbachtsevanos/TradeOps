import Overview from "@/features/overview/view/Overview.js";
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAccounts, useCreateAccount } from "../hooks/useAccount.js";

import { useStore } from "../../../app/hooks/useStore.js";
import Analytics from "../../analytics/index.js";
import Strategies from "../../strategies/index.js";
import Trades from "../../trades/index.js";

import { ErrorGuard, LoaderGuard } from "@/features/Guard/Guard.js";
import { AccountSelector, KpiStrip, Sidebar } from "../";
import { ROUTE_PATHS } from "../helpers/constants.js";
import { IDashboardProps } from "../types/dashboard.types.js";
import styles from "./Dashboard.module.scss";

const Dashboard = ({ theme }: IDashboardProps) => {
  const { selectedAccountId, setSelectedAccountId } = useStore();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const location = useLocation();

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

  if (accountsLoading) return <LoaderGuard />;

  if (!accounts) return <ErrorGuard text="Failed to load accounts" />;

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
    <div className={styles["dashboard-shell"]}>
      <Sidebar />

      <main className={styles.dashboard}>
        <div className={styles["dashboard-header"]}>
          <div>
            <p className={styles.eyebrow}>Trading workspace</p>
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
          <div className={styles["dashboard-content"]}>
            <Routes location={location}>
              <Route
                path={ROUTE_PATHS.overview}
                element={
                  <Overview
                    theme={theme}
                    selectedAccountId={selectedAccountId}
                  />
                }
              />
              <Route
                path={ROUTE_PATHS.trades}
                element={<Trades accountId={selectedAccountId} />}
              />
              <Route path={ROUTE_PATHS.strategies} element={<Strategies />} />
              <Route
                path={ROUTE_PATHS.analytics}
                element={<Analytics accountId={selectedAccountId} />}
              />
              <Route
                path="*"
                element={<Navigate to={ROUTE_PATHS.overview} replace />}
              />
            </Routes>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>Create or select an account to view data</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
