import { useStrategies, useUpdateStrategy } from "../../hooks/useStrategies";
import { IStrategy, StrategyItemsProps } from "../../types/strategies.types";
import styles from "../view/Strategies.module.css";

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
    <div className={styles["strategy-items"]}>
      {strategies?.length === 0 ? (
        <p className={styles["empty-state"]}>
          No strategies yet. Create one to get started.
        </p>
      ) : (
        strategies?.map((strategy) => (
          <div
            key={strategy.id}
            className={`${styles["strategy-item"]} ${selectedStrategyId === strategy.id ? styles.selected : ""}`}
            onClick={() => handleSelectStrategy(strategy.id)}
          >
            <div className={styles["strategy-info"]}>
              <div className={styles["strategy-name"]}>
                <span
                  className={`${styles["status-dot"]} ${strategy.isActive ? styles.active : styles.inactive}`}
                />
                {strategy.name}
              </div>
              <div className={styles["strategy-meta"]}>
                <span>Risk: {strategy.riskPercent ?? 2}%</span>
                <span>Trades: {strategy._count?.trades ?? 0}</span>
                {strategy.markets?.length ? (
                  <span>{strategy.markets.join(", ")}</span>
                ) : null}
              </div>
            </div>
            <div className={styles["strategy-actions"]}>
              <button
                className={styles["btn-icon"]}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(strategy);
                }}
                title={strategy.isActive ? "Deactivate" : "Activate"}
              >
                {strategy.isActive ? "⏸" : "▶"}
              </button>
              <button
                className={styles["btn-icon"]}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(strategy);
                }}
                title="Edit"
              >
                ✏
              </button>
              <button
                className={`${styles["btn-icon"]} ${styles["btn-delete"]}`}
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
