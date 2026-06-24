import { useState } from "react";
import {
  useTrades,
  useCloseTrade,
  type TradeFilters,
} from "../hooks/useTrades.js";
import styles from "./Trades.module.css";
import { ITtradesProps } from "../types/trades.types.js";

const Trades = ({ accountId }: ITtradesProps) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>("OPEN");
  const filters: TradeFilters = { accountId, page, limit: 20, status };
  const { data: tradesData, isLoading } = useTrades(filters);
  const { mutate: closeTrade, isPending: isClosing } = useCloseTrade();

  if (isLoading) {
    return <div className={styles.loading}>Loading trades...</div>;
  }

  if (!tradesData) {
    return <div className={styles.error}>Failed to load trades</div>;
  }

  const { items: trades, pagination } = tradesData;

  return (
    <div className={styles["trades-table"]}>
      <div className={styles["trades-header"]}>
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
        <p className={styles["empty-state"]}>No trades found</p>
      ) : (
        <>
          <table>
            <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th>Strategy</th>
                  <th>Entry Price</th>
                  <th>Entry Time</th>
                  <th>Exit Price</th>
                  <th>P&L</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`status-${trade.status.toLowerCase()}`}
                >
                  <td className={styles.symbol}>{trade.symbol}</td>
                  <td className={`${styles.direction} ${styles[trade.direction.toLowerCase()]}`}>
                    {trade.direction}
                  </td>
                  <td>{trade.strategy?.name || "-"}</td>
                  <td>${trade.entryPrice.toFixed(2)}</td>
                  <td>{new Date(trade.entryTime).toLocaleString()}</td>
                  <td>
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                  </td>
                  <td
                    className={`${styles.pnl} ${(trade.pnl ?? 0) >= 0 ? styles.positive : styles.negative}`}
                  >
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[`badge-${trade.status.toLowerCase()}` as keyof typeof styles]}`}
                    >
                      {trade.status}
                    </span>
                  </td>
                  <td>
                    {trade.status === "OPEN" && (
                      <button
                        className={styles["btn-close"]}
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

          <div className={styles.pagination}>
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
};

export default Trades;
