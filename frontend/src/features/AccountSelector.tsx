import React from "react";
import { Account } from "../types/index.js";
import "./AccountSelector.css";

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (accountId: string) => void;
}

function AccountSelector({
  accounts,
  selectedId,
  onSelect,
}: AccountSelectorProps) {
  if (accounts.length === 0) {
    return (
      <div className="account-selector">
        <p className="no-accounts">
          No trading accounts found. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="account-selector">
      <label>Select Trading Account:</label>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- Select Account --</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.externalId} - Balance: ${account.balance.toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AccountSelector;
