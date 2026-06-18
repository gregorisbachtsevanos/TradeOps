import { useState } from "react";
import {
  useCreateStrategy,
  useDeleteStrategy,
  useStrategies,
  useStrategyMetrics,
  useUpdateStrategy,
} from "../hooks/useStrategies.js";
import "./Strategies.css";

const Strategies = () => {
  const { data: strategies, isLoading } = useStrategies();
  const createStrategy = useCreateStrategy();
  const updateStrategy = useUpdateStrategy();
  const deleteStrategy = useDeleteStrategy();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    riskPercent: 2,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedStrategy = strategies?.find((s) => s.id === selectedStrategyId);
  const { data: metrics } = useStrategyMetrics(selectedStrategyId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateStrategy.mutateAsync({
        strategyId: editingId,
        data: {
          name: formData.name,
          description: formData.description,
          riskPercent: formData.riskPercent,
        },
      });
      setEditingId(null);
    } else {
      await createStrategy.mutateAsync(formData);
    }
    setFormData({ name: "", description: "", riskPercent: 2 });
  };

  const handleEdit = (strategy: {
    id: string;
    name: string;
    description?: string;
    riskPercent: number;
  }) => {
    setEditingId(strategy.id);
    setFormData({
      name: strategy.name,
      description: strategy.description || "",
      riskPercent: strategy.riskPercent,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", riskPercent: 2 });
  };

  const handleToggleActive = async (strategy: {
    id: string;
    isActive: boolean;
  }) => {
    await updateStrategy.mutateAsync({
      strategyId: strategy.id,
      data: { isActive: !strategy.isActive },
    });
  };

  const handleDelete = async (strategyId: string) => {
    await deleteStrategy.mutateAsync(strategyId);
    if (selectedStrategyId === strategyId) {
      setSelectedStrategyId(null);
    }
  };

  const formatMoney = (value: number | null | undefined) =>
    `$${(value ?? 0).toFixed(2)}`;

  if (isLoading) {
    return <div className="loading">Loading strategies...</div>;
  }

  return (
    <div className="strategies-page">
      <div className="strategies-layout">
        <div className="strategies-list-panel">
          <div className="panel-header">
            <h3>Strategies</h3>
            <button
              className="btn-create"
              onClick={() => {
                setEditingId(null);
                setFormData({ name: "", description: "", riskPercent: 2 });
              }}
            >
              + New Strategy
            </button>
          </div>

          {(editingId || !selectedStrategyId) && (
            <form className="strategy-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Strategy name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Risk % per Trade</label>
                <input
                  type="number"
                  value={formData.riskPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      riskPercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0.1}
                  max={100}
                  step={0.1}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? "Update" : "Create"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="strategy-items">
            {strategies?.length === 0 ? (
              <p className="empty-state">
                No strategies yet. Create one to get started.
              </p>
            ) : (
              strategies?.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`strategy-item ${selectedStrategyId === strategy.id ? "selected" : ""}`}
                  onClick={() => setSelectedStrategyId(strategy.id)}
                >
                  <div className="strategy-info">
                    <div className="strategy-name">
                      <span
                        className={`status-dot ${strategy.isActive ? "active" : "inactive"}`}
                      />
                      {strategy.name}
                    </div>
                    <div className="strategy-meta">
                      <span>Risk: {strategy.riskPercent}%</span>
                      <span>Trades: {strategy._count?.trades ?? 0}</span>
                      <span>Signals: {strategy._count?.signals ?? 0}</span>
                    </div>
                  </div>
                  <div className="strategy-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(strategy);
                      }}
                      title={strategy.isActive ? "Deactivate" : "Activate"}
                    >
                      {strategy.isActive ? "⏸" : "▶"}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(strategy);
                      }}
                      title="Edit"
                    >
                      ✏
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy.id);
                      }}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
                    <span>Risk: {selectedStrategy.riskPercent}% per trade</span>
                    <span>
                      Created:{" "}
                      {new Date(
                        selectedStrategy.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

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
                      {metrics.totalWinningTrades} / {metrics.totalLosingTrades}
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
            </>
          ) : (
            <div className="placeholder-detail">
              <p>Select a strategy to view details and performance metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Strategies;
