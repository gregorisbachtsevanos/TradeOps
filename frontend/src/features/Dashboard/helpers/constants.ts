import { TAllTabs } from "../types/dashboard.types";

export const NAV_ITEMS: Array<{
  id: TAllTabs;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "overview",
    label: "Markets",
    description: "Chart & risk overview",
    icon: "📈",
  },
  {
    id: "trades",
    label: "Trades",
    description: "Open positions",
    icon: "⚡",
  },
  {
    id: "strategies",
    label: "Strategies",
    description: "Manage strategies",
    icon: "🎯",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Performance reports",
    icon: "📊",
  },
];
