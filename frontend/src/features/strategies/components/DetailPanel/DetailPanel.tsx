import { TABS } from "../../helpers/constants";
import { useStrategies, useStrategyMetrics } from "../../hooks/useStrategies";
import { IDetailPanelProps } from "../../types/strategies.types";
import styles from "../view/Strategies.module.css";

const DetailPanel = ({
  selectedStrategyId,
  activeTab,
  handleChangeTab,
}: IDetailPanelProps) => {
  const { data: strategies } = useStrategies();
  const { data: metrics } = useStrategyMetrics(selectedStrategyId || "");

  const selectedStrategy = strategies?.find((s) => s.id === selectedStrategyId);
  const formatMoney = (value: number | null | undefined) =>
    `$${(value ?? 0).toFixed(2)}`;

  return (
    <div className={styles["strategy-detail-panel"]}>
      {selectedStrategy ? (
        <>
          <div className={styles["detail-header"]}>
            <div>
              <h3>{selectedStrategy.name}</h3>
              {selectedStrategy.description && (
                <p className={styles["detail-description"]}>
                  {selectedStrategy.description}
                </p>
              )}
              <div className={styles["detail-meta"]}>
                <span
                  className={`${styles["status-badge"]} ${selectedStrategy.isActive ? styles.active : styles.inactive}`}
                >
                  {selectedStrategy.isActive ? "Active" : "Inactive"}
                </span>
                <span>
                  Risk: {selectedStrategy.riskPercent ?? 2}% per trade
                </span>
                {selectedStrategy.version ? (
                  <span>v{selectedStrategy.version}</span>
                ) : null}
                <span>
                  Created:{" "}
                  {new Date(selectedStrategy.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className={styles["detail-tabs"]}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles["tab-btn"]} ${activeTab === tab.id ? styles.active : ""}`}
                onClick={() => handleChangeTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles["tab-content"]}>
            {activeTab === "overview" && (
              <div className={styles["overview-section"]}>
                <div className={styles["info-grid"]}>
                  {selectedStrategy.markets?.length ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Markets</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.markets
                          .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.instruments?.length ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Instruments</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.instruments.join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.analysisTimeframe ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Analysis Timeframe</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.analysisTimeframe}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.entryTimeframe ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Entry Timeframe</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.entryTimeframe}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.conditions?.length ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Conditions</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.conditions
                          .map((c) => c.replace(/_/g, " "))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.sessions?.length ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Sessions</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.sessions
                          .map((s) => s.replace(/_/g, " "))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
                {selectedStrategy.notes && (
                  <div className={styles["notes-block"]}>
                    <span className={styles["info-label"]}>Notes</span>
                    <p className={styles["notes-text"]}>{selectedStrategy.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "rules" && (
              <div className={styles["rules-section"]}>
                {selectedStrategy.entryRules?.length ? (
                  <div className={styles["rule-group"]}>
                    <h4>Entry Rules</h4>
                    {selectedStrategy.entryRules.map((rule, i) => (
                      <div key={i} className={styles["rule-card"]}>
                        <div className={styles["rule-header"]}>
                          <span className={`${styles["rule-type-badge"]} ${styles[rule.type]}`}>
                            {rule.type}
                          </span>
                          <span className={styles["rule-name"]}>{rule.name}</span>
                          {rule.required && (
                            <span className={styles["required-badge"]}>Required</span>
                          )}
                        </div>
                        {rule.description && (
                          <p className={styles["rule-desc"]}>{rule.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.confirmations?.length ? (
                  <div className={styles["rule-group"]}>
                    <h4>Confirmations</h4>
                    {selectedStrategy.confirmations.map((c, i) => (
                      <div key={i} className={styles["rule-card"]}>
                        <div className={styles["rule-header"]}>
                          <span className={`${styles["rule-type-badge"]} ${styles[c.type]}`}>
                            {c.type}
                          </span>
                          <span className={styles["rule-name"]}>{c.name}</span>
                        </div>
                        {c.description && (
                          <p className={styles["rule-desc"]}>{c.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.exitRules?.length ? (
                  <div className={styles["rule-group"]}>
                    <h4>Exit Rules</h4>
                    {selectedStrategy.exitRules.map((rule, i) => (
                      <div key={i} className={styles["rule-card"]}>
                        <div className={styles["rule-header"]}>
                          <span className={`${styles["rule-type-badge"]} ${styles[rule.type]}`}>
                            {rule.type}
                          </span>
                          <span className={styles["rule-name"]}>{rule.name}</span>
                        </div>
                        {rule.description && (
                          <p className={styles["rule-desc"]}>{rule.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.checklist?.length ? (
                  <div className={styles["rule-group"]}>
                    <h4>Pre-Trade Checklist</h4>
                    {selectedStrategy.checklist.map((item, i) => (
                      <div key={i} className={styles["checklist-item"]}>
                        <span
                          className={`${styles["check-icon"]} ${item.required ? styles.required : ""}`}
                        >
                          {item.required ? "●" : "○"}
                        </span>
                        <div>
                          <span className={styles["check-name"]}>{item.name}</span>
                          {item.description && (
                            <p className={styles["check-desc"]}>{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {!selectedStrategy.entryRules?.length &&
                  !selectedStrategy.confirmations?.length &&
                  !selectedStrategy.exitRules?.length &&
                  !selectedStrategy.checklist?.length && (
                    <p className={styles["empty-state"]}>No rules defined yet.</p>
                  )}
              </div>
            )}

            {activeTab === "risk" && (
              <div className={styles["risk-section"]}>
                <div className={styles["info-grid"]}>
                  <div className={styles["info-block"]}>
                    <span className={styles["info-label"]}>Risk Per Trade</span>
                    <span className={styles["info-value"]}>
                      {selectedStrategy.riskPercent ?? 2}%
                    </span>
                  </div>
                  {selectedStrategy.maxDailyLoss ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Max Daily Loss</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.maxDailyLoss}%
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxDrawdown ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Max Drawdown</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.maxDrawdown}%
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxOpenTrades ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Max Open Trades</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.maxOpenTrades}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxDailyTrades ? (
                    <div className={styles["info-block"]}>
                      <span className={styles["info-label"]}>Max Daily Trades</span>
                      <span className={styles["info-value"]}>
                        {selectedStrategy.maxDailyTrades}
                      </span>
                    </div>
                  ) : null}
                </div>

                {selectedStrategy.stopLoss && (
                  <div className={styles["rule-group"]}>
                    <h4>Stop Loss</h4>
                    <div className={styles["rule-card"]}>
                      <div className={styles["rule-header"]}>
                        <span
                          className={`${styles["rule-type-badge"]} ${styles[selectedStrategy.stopLoss.type]}`}
                        >
                          {selectedStrategy.stopLoss.type}
                        </span>
                      </div>
                      {selectedStrategy.stopLoss.description && (
                        <p className={styles["rule-desc"]}>
                          {selectedStrategy.stopLoss.description}
                        </p>
                      )}
                      {selectedStrategy.stopLoss.atrMultiplier && (
                        <p className={styles["rule-param"]}>
                          ATR Multiplier:{" "}
                          {selectedStrategy.stopLoss.atrMultiplier}x
                        </p>
                      )}
                      {selectedStrategy.stopLoss.percentage && (
                        <p className={styles["rule-param"]}>
                          Percentage: {selectedStrategy.stopLoss.percentage}%
                        </p>
                      )}
                      {selectedStrategy.stopLoss.fixedPips && (
                        <p className={styles["rule-param"]}>
                          Fixed Pips: {selectedStrategy.stopLoss.fixedPips}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategy.tpTargets?.length && (
                  <div className={styles["rule-group"]}>
                    <h4>Take Profit Targets</h4>
                    {selectedStrategy.tpTargets.map((tp, i) => (
                      <div key={i} className={styles["rule-card"]}>
                        <div className={styles["rule-header"]}>
                          <span className={styles["tp-label"]}>TP {i + 1}</span>
                          <span className={`${styles["rule-type-badge"]} ${styles[tp.type]}`}>
                            {tp.type}
                          </span>
                          {tp.riskReward && (
                            <span className={styles["rr-badge"]}>1:{tp.riskReward}</span>
                          )}
                          {tp.partialPercent && (
                            <span className={styles["partial-badge"]}>
                              {tp.partialPercent}% partial
                            </span>
                          )}
                        </div>
                        {tp.description && (
                          <p className={styles["rule-desc"]}>{tp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedStrategy.tradeManagement && (
                  <div className={styles["rule-group"]}>
                    <h4>Trade Management</h4>
                    <div className={styles["rule-card"]}>
                      {selectedStrategy.tradeManagement.breakevenTrigger && (
                        <p className={styles["rule-param"]}>
                          Breakeven at{" "}
                          {selectedStrategy.tradeManagement.breakevenTrigger}
                          pips profit
                        </p>
                      )}
                      {selectedStrategy.tradeManagement.trailingStop && (
                        <p className={styles["rule-param"]}>
                          Trailing stop:{" "}
                          {selectedStrategy.tradeManagement.trailingStopPips}
                          pips
                          {selectedStrategy.tradeManagement.trailingStopAt
                            ? ` after ${selectedStrategy.tradeManagement.trailingStopAt}pips`
                            : ""}
                        </p>
                      )}
                      {selectedStrategy.tradeManagement.maxHoldTime && (
                        <p className={styles["rule-param"]}>
                          Max hold time:{" "}
                          {selectedStrategy.tradeManagement.maxHoldTime}h
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategy.newsRules && (
                  <div className={styles["rule-group"]}>
                    <h4>News Rules</h4>
                    <div className={styles["rule-card"]}>
                      {selectedStrategy.newsRules.avoidHighImpact && (
                        <p className={styles["rule-param"]}>Avoid high-impact news</p>
                      )}
                      {selectedStrategy.newsRules.minutesBefore && (
                        <p className={styles["rule-param"]}>
                          No trades {selectedStrategy.newsRules.minutesBefore}
                          min before news
                        </p>
                      )}
                      {selectedStrategy.newsRules.minutesAfter && (
                        <p className={styles["rule-param"]}>
                          No trades {selectedStrategy.newsRules.minutesAfter}min
                          after news
                        </p>
                      )}
                      {selectedStrategy.newsRules.closeBeforeNews && (
                        <p className={styles["rule-param"]}>
                          Close positions before news
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "performance" && (
              <>
                {metrics ? (
                  <div className={styles["metrics-grid"]}>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Total Trades</span>
                      <span className={styles.value}>{metrics.totalTrades}</span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Win Rate</span>
                      <span className={styles.value}>
                        {(metrics.winRate ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Wins / Losses</span>
                      <span className={styles.value}>
                        {metrics.totalWinningTrades} /{" "}
                        {metrics.totalLosingTrades}
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Total Profit</span>
                      <span className={`${styles.value} ${styles.positive}`}>
                        {formatMoney(metrics.totalProfit)}
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Total Loss</span>
                      <span className={`${styles.value} ${styles.negative}`}>
                        {formatMoney(metrics.totalLoss)}
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Profit Factor</span>
                      <span className={styles.value}>
                        {typeof metrics.profitFactor === "number" &&
                        Number.isFinite(metrics.profitFactor)
                          ? metrics.profitFactor.toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Max Drawdown</span>
                      <span className={`${styles.value} ${styles.negative}`}>
                        {(metrics.maxDrawdown ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className={styles["metric-card"]}>
                      <span className={styles.label}>Avg Win / Loss</span>
                      <span className={styles.value}>
                        {formatMoney(metrics.averageWin)} /{" "}
                        {formatMoney(metrics.averageLoss)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={styles["empty-state"]}>
                    No performance data yet. Metrics will appear after trades
                    close.
                  </p>
                )}

                {selectedStrategy.backtestingMetrics && (
                  <div className={styles["backtesting-section"]}>
                    <h4>Backtesting Results</h4>
                    <div className={styles["metrics-grid"]}>
                      {selectedStrategy.backtestingMetrics.totalTrades !=
                        null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Total Trades</span>
                          <span className={styles.value}>
                            {selectedStrategy.backtestingMetrics.totalTrades}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.winRate != null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Win Rate</span>
                          <span className={styles.value}>
                            {selectedStrategy.backtestingMetrics.winRate.toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.profitFactor !=
                        null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Profit Factor</span>
                          <span className={styles.value}>
                            {selectedStrategy.backtestingMetrics.profitFactor.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.maxDrawdown !=
                        null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Max Drawdown</span>
                          <span className={`${styles.value} ${styles.negative}`}>
                            {selectedStrategy.backtestingMetrics.maxDrawdown.toFixed(
                              2,
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.sharpeRatio !=
                        null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Sharpe Ratio</span>
                          <span className={styles.value}>
                            {selectedStrategy.backtestingMetrics.sharpeRatio.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.avgRR != null && (
                        <div className={styles["metric-card"]}>
                          <span className={styles.label}>Avg R:R</span>
                          <span className={styles.value}>
                            1:
                            {selectedStrategy.backtestingMetrics.avgRR.toFixed(
                              1,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className={styles["placeholder-detail"]}>
          <p>Select a strategy to view details and performance metrics</p>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;
