import { Account } from "../../types/index.js";
import "./AccountSelector.css";

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (accountId: string) => void;
  onCreateDemoAccount?: () => void;
  isCreating?: boolean;
}

function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  onCreateDemoAccount,
  isCreating = false,
}: AccountSelectorProps) {
  if (accounts.length === 0) {
    return (
      <div className="account-selector empty-state">
        <div>
          <p className="empty-title">No trading accounts connected</p>
          <p className="no-accounts">
            Spin up a demo MT5 account to explore the dashboard with realistic
            mock data.
          </p>
        </div>
        {onCreateDemoAccount && (
          <button
            className="btn-create-account"
            onClick={onCreateDemoAccount}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Demo Account"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="account-selector">
      <label>Trading Account</label>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.externalId} · ${account.balance.toFixed(2)} balance ·{" "}
            {account.isActive ? "Active" : "Inactive"}
          </option>
        ))}
      </select>
      <div className="account-status">
        {accounts.length} account{accounts.length === 1 ? "" : "s"} synced
      </div>
    </div>
  );
}

export default AccountSelector;
