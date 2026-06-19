import { useEffect, useState } from "react";
import { IStrategy, TTabId } from "../types/strategies.types.js";
import {
  useCreateStrategy,
  useDeleteStrategy,
  useStrategies,
  useUpdateStrategy,
} from "./useStrategies.js";

const useHandleStrategies = () => {
  const { data: strategies, isLoading } = useStrategies();
  const createStrategy = useCreateStrategy();
  const updateStrategy = useUpdateStrategy();
  const deleteStrategy = useDeleteStrategy();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TTabId>("overview");
  const [editStrategy, setEditStrategy] = useState<IStrategy | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (strategies?.length) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies]);

  const handleEdit = (strategy: IStrategy) => {
    setEditStrategy(strategy);
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
    if (editStrategy) {
      await updateStrategy.mutateAsync({
        strategyId: editStrategy.id,
        data,
      });
    } else {
      await createStrategy.mutateAsync(data);
    }
    setWizardOpen(false);
    setEditStrategy(null);
  };

  const handleCreateNewStrategy = (isWizardOpen: boolean) => {
    setEditStrategy(null);
    setWizardOpen(isWizardOpen);
  };

  const handleChangeTab = (selectedTab: TTabId) => setActiveTab(selectedTab);

  return {
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
  };
};

export default useHandleStrategies;
