import { useState } from "react";
import { IStrategy, TTabId } from "../types/strategies.types.js";
import {
  useCreateStrategy,
  useDeleteStrategy,
  useStrategies,
  useUpdateStrategy,
} from "./useStrategies.js";

const useHandleStrategies = () => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TTabId>("overview");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<IStrategy | null>(
    null,
  );
  const createStrategy = useCreateStrategy();
  const updateStrategy = useUpdateStrategy();
  const deleteStrategy = useDeleteStrategy();
  const { isLoading } = useStrategies();

  const handleEdit = (strategy: IStrategy) => {
    setEditingStrategy(strategy);
    setWizardOpen(true);
  };

  const handleDelete = async (strategyId: string) => {
    await deleteStrategy.mutateAsync(strategyId);
    if (selectedStrategyId === strategyId) {
      setSelectedStrategyId(null);
    }
  };

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedStrategyId(strategyId);
    handleChangeTab("overview");
  };

  const handleWizardSubmit = async (data: Partial<IStrategy> | any) => {
    if (editingStrategy) {
      await updateStrategy.mutateAsync({
        strategyId: editingStrategy.id,
        data,
      });
    } else {
      await createStrategy.mutateAsync(data);
    }
    setWizardOpen(false);
    setEditingStrategy(null);
  };

  const handleCreateNewStrategy = (isWizardOpen: boolean) => {
    setEditingStrategy(null);
    setWizardOpen(isWizardOpen);
  };

  const handleChangeTab = (selectedTab: TTabId) => setActiveTab(selectedTab);

  return {
    isLoading,
    activeTab,
    wizardOpen,
    selectedStrategyId,
    editingStrategy,
    handleEdit,
    handleDelete,
    handleSelectStrategy,
    handleWizardSubmit,
    handleCreateNewStrategy,
    handleChangeTab,
  };
};

export default useHandleStrategies;
