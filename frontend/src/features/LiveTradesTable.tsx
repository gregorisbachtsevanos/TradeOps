import React, { useState } from "react";
import { useTrades, useCloseTrade } from "../hooks/useApi.js";
import "./LiveTradesTable.css";

interface LiveTradesTableProps {
  accountId: string;
}

function LiveTradesTable({ accountId }: LiveTradesTableProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>("OPEN");
  const { data: response, isLoading } = useTrades(accountId, page, 20, status);
  const { mutate: closeTrade, isLoading: isClosing } = useCloseTrade();

  if (isLoading) {
    return <div className="loading">Loading trades...</div>;
  }

  if (!response?.data) {
    return <div className="error">Failed to load trades</div>;
  }

  const trades = response.data.data || [];
  const pagination = response.data.pagination || {};

  return (
    <div className="trades-table">
      <div className="trades-header">
        <h3>Trading Activity</h3>
        <select
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {trades.length === 0 ? (
        <p className="empty-state">No trades found</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Direction</th>
                <th>Entry Price</th>
                <th>Entry Time</th>
                <th>Exit Price</th>
                <th>P&L</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade: any) => (
                <tr
                  key={trade.id}
                  className={`status-${trade.status.toLowerCase()}`}
                >
                  <td className="symbol">{trade.symbol}</td>
                  <td className={`direction ${trade.direction.toLowerCase()}`}>
                    {trade.direction}
                  </td>
                  <td>${trade.entryPrice.toFixed(2)}</td>
                  <td>{new Date(trade.entryTime).toLocaleString()}</td>
                  <td>
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                  </td>
                  <td
                    className={`pnl ${trade.pnl >= 0 ? "positive" : "negative"}`}
                  >
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${trade.status.toLowerCase()}`}
                    >
                      {trade.status}
                    </span>
                  </td>
                  <td>
                    {trade.status === "OPEN" && (
                      <button
                        className="btn-close"
                        onClick={() => closeTrade(trade.id)}
                        disabled={isClosing}
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pagination.pages || 1}
            </span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LiveTradesTable;
