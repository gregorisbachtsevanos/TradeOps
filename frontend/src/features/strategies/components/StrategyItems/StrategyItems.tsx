import { useStrategies, useUpdateStrategy } from "../../hooks/useStrategies";
import { IStrategy, StrategyItemsProps } from "../../types/strategies.types";

const StrategyItems = ({
  selectedStrategyId,
  handleEdit,
  handleDelete,
  handleSelectStrategy,
}: StrategyItemsProps) => {
  const { data: strategies } = useStrategies();
  const updateStrategy = useUpdateStrategy();

  const handleToggleActive = async (strategy: IStrategy) => {
    await updateStrategy.mutateAsync({
      strategyId: strategy.id,
      data: { isActive: !strategy.isActive },
    });
  };

  return (
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
            onClick={() => handleSelectStrategy(strategy.id)}
          >
            <div className="strategy-info">
              <div className="strategy-name">
                <span
                  className={`status-dot ${strategy.isActive ? "active" : "inactive"}`}
                />
                {strategy.name}
              </div>
              <div className="strategy-meta">
                <span>Risk: {strategy.riskPercent ?? 2}%</span>
                <span>Trades: {strategy._count?.trades ?? 0}</span>
                {strategy.markets?.length ? (
                  <span>{strategy.markets.join(", ")}</span>
                ) : null}
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
  );
};

export default StrategyItems;
