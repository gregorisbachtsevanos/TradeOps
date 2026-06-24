import DetailPanel from "../components/DetailPanel/DetailPanel.js";
import StrategyItems from "../components/StrategyItems/StrategyItems.js";
import StrategyWizard from "../components/StrategyWizard/StrategyWizard.js";
import useHandleStrategies from "../hooks/useHandleStrateries.js";
import styles from "./Strategies.module.css";

const Strategies = () => {
  const {
    isLoading,
    activeTab,
    wizardOpen,
    selectedStrategyId,
    editStrategy,
    handleEdit,
    handleDelete,
    handleSelectStrategy,
    handleWizardSubmit,
    handleCreateNewStrategy,
    handleChangeTab,
  } = useHandleStrategies();

  if (isLoading) {
    return <div className={styles.loading}>Loading strategies...</div>;
  }

  return (
    <div className={styles["strategies-page"]}>
      <div className={styles["strategies-layout"]}>
        <div className={styles["strategies-list-panel"]}>
          <div className={styles["panel-header"]}>
            <h3>Strategies</h3>
            <button
              className={styles["btn-create"]}
              onClick={() => handleCreateNewStrategy(true)}
            >
              + New Strategy
            </button>
          </div>
          <StrategyItems
            selectedStrategyId={selectedStrategyId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSelectStrategy={handleSelectStrategy}
          />
        </div>

        <DetailPanel
          selectedStrategyId={selectedStrategyId}
          activeTab={activeTab}
          handleChangeTab={handleChangeTab}
        />
      </div>

      {wizardOpen && (
        <StrategyWizard
          strategy={editStrategy}
          onSubmit={handleWizardSubmit}
          onClose={() => handleCreateNewStrategy(false)}
        />
      )}
    </div>
  );
};

export default Strategies;
