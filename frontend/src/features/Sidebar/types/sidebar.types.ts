export type TDashboardTab = "overview" | "trades" | "analytics";

export interface ISidebarProps {
  activeTab: TDashboardTab;
  onTabChange: (tab: TDashboardTab) => void;
}
