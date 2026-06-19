import { TABS } from "../../helpers/constants";
import { useStrategies, useStrategyMetrics } from "../../hooks/useStrategies";
import { IDetailPanelProps } from "../../types/strategies.types";

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
    <div className="strategy-detail-panel">
      {selectedStrategy ? (
        <>
          <div className="detail-header">
            <div>
              <h3>{selectedStrategy.name}</h3>
              {selectedStrategy.description && (
                <p className="detail-description">
                  {selectedStrategy.description}
                </p>
              )}
              <div className="detail-meta">
                <span
                  className={`status-badge ${selectedStrategy.isActive ? "active" : "inactive"}`}
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

          <div className="detail-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => handleChangeTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-section">
                <div className="info-grid">
                  {selectedStrategy.markets?.length ? (
                    <div className="info-block">
                      <span className="info-label">Markets</span>
                      <span className="info-value">
                        {selectedStrategy.markets
                          .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.instruments?.length ? (
                    <div className="info-block">
                      <span className="info-label">Instruments</span>
                      <span className="info-value">
                        {selectedStrategy.instruments.join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.analysisTimeframe ? (
                    <div className="info-block">
                      <span className="info-label">Analysis Timeframe</span>
                      <span className="info-value">
                        {selectedStrategy.analysisTimeframe}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.entryTimeframe ? (
                    <div className="info-block">
                      <span className="info-label">Entry Timeframe</span>
                      <span className="info-value">
                        {selectedStrategy.entryTimeframe}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.conditions?.length ? (
                    <div className="info-block">
                      <span className="info-label">Conditions</span>
                      <span className="info-value">
                        {selectedStrategy.conditions
                          .map((c) => c.replace(/_/g, " "))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.sessions?.length ? (
                    <div className="info-block">
                      <span className="info-label">Sessions</span>
                      <span className="info-value">
                        {selectedStrategy.sessions
                          .map((s) => s.replace(/_/g, " "))
                          .join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
                {selectedStrategy.notes && (
                  <div className="notes-block">
                    <span className="info-label">Notes</span>
                    <p className="notes-text">{selectedStrategy.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "rules" && (
              <div className="rules-section">
                {selectedStrategy.entryRules?.length ? (
                  <div className="rule-group">
                    <h4>Entry Rules</h4>
                    {selectedStrategy.entryRules.map((rule, i) => (
                      <div key={i} className="rule-card">
                        <div className="rule-header">
                          <span className={`rule-type-badge ${rule.type}`}>
                            {rule.type}
                          </span>
                          <span className="rule-name">{rule.name}</span>
                          {rule.required && (
                            <span className="required-badge">Required</span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="rule-desc">{rule.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.confirmations?.length ? (
                  <div className="rule-group">
                    <h4>Confirmations</h4>
                    {selectedStrategy.confirmations.map((c, i) => (
                      <div key={i} className="rule-card">
                        <div className="rule-header">
                          <span className={`rule-type-badge ${c.type}`}>
                            {c.type}
                          </span>
                          <span className="rule-name">{c.name}</span>
                        </div>
                        {c.description && (
                          <p className="rule-desc">{c.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.exitRules?.length ? (
                  <div className="rule-group">
                    <h4>Exit Rules</h4>
                    {selectedStrategy.exitRules.map((rule, i) => (
                      <div key={i} className="rule-card">
                        <div className="rule-header">
                          <span className={`rule-type-badge ${rule.type}`}>
                            {rule.type}
                          </span>
                          <span className="rule-name">{rule.name}</span>
                        </div>
                        {rule.description && (
                          <p className="rule-desc">{rule.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedStrategy.checklist?.length ? (
                  <div className="rule-group">
                    <h4>Pre-Trade Checklist</h4>
                    {selectedStrategy.checklist.map((item, i) => (
                      <div key={i} className="checklist-item">
                        <span
                          className={`check-icon ${item.required ? "required" : ""}`}
                        >
                          {item.required ? "●" : "○"}
                        </span>
                        <div>
                          <span className="check-name">{item.name}</span>
                          {item.description && (
                            <p className="check-desc">{item.description}</p>
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
                    <p className="empty-state">No rules defined yet.</p>
                  )}
              </div>
            )}

            {activeTab === "risk" && (
              <div className="risk-section">
                <div className="info-grid">
                  <div className="info-block">
                    <span className="info-label">Risk Per Trade</span>
                    <span className="info-value">
                      {selectedStrategy.riskPercent ?? 2}%
                    </span>
                  </div>
                  {selectedStrategy.maxDailyLoss ? (
                    <div className="info-block">
                      <span className="info-label">Max Daily Loss</span>
                      <span className="info-value">
                        {selectedStrategy.maxDailyLoss}%
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxDrawdown ? (
                    <div className="info-block">
                      <span className="info-label">Max Drawdown</span>
                      <span className="info-value">
                        {selectedStrategy.maxDrawdown}%
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxOpenTrades ? (
                    <div className="info-block">
                      <span className="info-label">Max Open Trades</span>
                      <span className="info-value">
                        {selectedStrategy.maxOpenTrades}
                      </span>
                    </div>
                  ) : null}
                  {selectedStrategy.maxDailyTrades ? (
                    <div className="info-block">
                      <span className="info-label">Max Daily Trades</span>
                      <span className="info-value">
                        {selectedStrategy.maxDailyTrades}
                      </span>
                    </div>
                  ) : null}
                </div>

                {selectedStrategy.stopLoss && (
                  <div className="rule-group">
                    <h4>Stop Loss</h4>
                    <div className="rule-card">
                      <div className="rule-header">
                        <span
                          className={`rule-type-badge ${selectedStrategy.stopLoss.type}`}
                        >
                          {selectedStrategy.stopLoss.type}
                        </span>
                      </div>
                      {selectedStrategy.stopLoss.description && (
                        <p className="rule-desc">
                          {selectedStrategy.stopLoss.description}
                        </p>
                      )}
                      {selectedStrategy.stopLoss.atrMultiplier && (
                        <p className="rule-param">
                          ATR Multiplier:{" "}
                          {selectedStrategy.stopLoss.atrMultiplier}x
                        </p>
                      )}
                      {selectedStrategy.stopLoss.percentage && (
                        <p className="rule-param">
                          Percentage: {selectedStrategy.stopLoss.percentage}%
                        </p>
                      )}
                      {selectedStrategy.stopLoss.fixedPips && (
                        <p className="rule-param">
                          Fixed Pips: {selectedStrategy.stopLoss.fixedPips}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategy.tpTargets?.length && (
                  <div className="rule-group">
                    <h4>Take Profit Targets</h4>
                    {selectedStrategy.tpTargets.map((tp, i) => (
                      <div key={i} className="rule-card">
                        <div className="rule-header">
                          <span className="tp-label">TP {i + 1}</span>
                          <span className={`rule-type-badge ${tp.type}`}>
                            {tp.type}
                          </span>
                          {tp.riskReward && (
                            <span className="rr-badge">1:{tp.riskReward}</span>
                          )}
                          {tp.partialPercent && (
                            <span className="partial-badge">
                              {tp.partialPercent}% partial
                            </span>
                          )}
                        </div>
                        {tp.description && (
                          <p className="rule-desc">{tp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedStrategy.tradeManagement && (
                  <div className="rule-group">
                    <h4>Trade Management</h4>
                    <div className="rule-card">
                      {selectedStrategy.tradeManagement.breakevenTrigger && (
                        <p className="rule-param">
                          Breakeven at{" "}
                          {selectedStrategy.tradeManagement.breakevenTrigger}
                          pips profit
                        </p>
                      )}
                      {selectedStrategy.tradeManagement.trailingStop && (
                        <p className="rule-param">
                          Trailing stop:{" "}
                          {selectedStrategy.tradeManagement.trailingStopPips}
                          pips
                          {selectedStrategy.tradeManagement.trailingStopAt
                            ? ` after ${selectedStrategy.tradeManagement.trailingStopAt}pips`
                            : ""}
                        </p>
                      )}
                      {selectedStrategy.tradeManagement.maxHoldTime && (
                        <p className="rule-param">
                          Max hold time:{" "}
                          {selectedStrategy.tradeManagement.maxHoldTime}h
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategy.newsRules && (
                  <div className="rule-group">
                    <h4>News Rules</h4>
                    <div className="rule-card">
                      {selectedStrategy.newsRules.avoidHighImpact && (
                        <p className="rule-param">Avoid high-impact news</p>
                      )}
                      {selectedStrategy.newsRules.minutesBefore && (
                        <p className="rule-param">
                          No trades {selectedStrategy.newsRules.minutesBefore}
                          min before news
                        </p>
                      )}
                      {selectedStrategy.newsRules.minutesAfter && (
                        <p className="rule-param">
                          No trades {selectedStrategy.newsRules.minutesAfter}min
                          after news
                        </p>
                      )}
                      {selectedStrategy.newsRules.closeBeforeNews && (
                        <p className="rule-param">
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
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <span className="label">Total Trades</span>
                      <span className="value">{metrics.totalTrades}</span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Win Rate</span>
                      <span className="value">
                        {(metrics.winRate ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Wins / Losses</span>
                      <span className="value">
                        {metrics.totalWinningTrades} /{" "}
                        {metrics.totalLosingTrades}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Total Profit</span>
                      <span className="value positive">
                        {formatMoney(metrics.totalProfit)}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Total Loss</span>
                      <span className="value negative">
                        {formatMoney(metrics.totalLoss)}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Profit Factor</span>
                      <span className="value">
                        {typeof metrics.profitFactor === "number" &&
                        Number.isFinite(metrics.profitFactor)
                          ? metrics.profitFactor.toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Max Drawdown</span>
                      <span className="value negative">
                        {(metrics.maxDrawdown ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Avg Win / Loss</span>
                      <span className="value">
                        {formatMoney(metrics.averageWin)} /{" "}
                        {formatMoney(metrics.averageLoss)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="empty-state">
                    No performance data yet. Metrics will appear after trades
                    close.
                  </p>
                )}

                {selectedStrategy.backtestingMetrics && (
                  <div className="backtesting-section">
                    <h4>Backtesting Results</h4>
                    <div className="metrics-grid">
                      {selectedStrategy.backtestingMetrics.totalTrades !=
                        null && (
                        <div className="metric-card">
                          <span className="label">Total Trades</span>
                          <span className="value">
                            {selectedStrategy.backtestingMetrics.totalTrades}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.winRate != null && (
                        <div className="metric-card">
                          <span className="label">Win Rate</span>
                          <span className="value">
                            {selectedStrategy.backtestingMetrics.winRate.toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.profitFactor !=
                        null && (
                        <div className="metric-card">
                          <span className="label">Profit Factor</span>
                          <span className="value">
                            {selectedStrategy.backtestingMetrics.profitFactor.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.maxDrawdown !=
                        null && (
                        <div className="metric-card">
                          <span className="label">Max Drawdown</span>
                          <span className="value negative">
                            {selectedStrategy.backtestingMetrics.maxDrawdown.toFixed(
                              2,
                            )}
                            %
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.sharpeRatio !=
                        null && (
                        <div className="metric-card">
                          <span className="label">Sharpe Ratio</span>
                          <span className="value">
                            {selectedStrategy.backtestingMetrics.sharpeRatio.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                      {selectedStrategy.backtestingMetrics.avgRR != null && (
                        <div className="metric-card">
                          <span className="label">Avg R:R</span>
                          <span className="value">
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
        <div className="placeholder-detail">
          <p>Select a strategy to view details and performance metrics</p>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;
