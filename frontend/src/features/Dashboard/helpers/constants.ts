import { TAllTabs } from "../types/dashboard.types";

export const NAV_ITEMS: Array<{
  id: TAllTabs;
  label: string;
  description: string;
  icon: string;
  path: string;
}> = [
  {
    id: "overview",
    label: "Markets",
    description: "Chart & risk overview",
    icon: "📈",
    path: "/home",
  },
  {
    id: "trades",
    label: "Trades",
    description: "Open positions",
    icon: "⚡",
    path: "/trades",
  },
  {
    id: "strategies",
    label: "Strategies",
    description: "Manage strategies",
    icon: "🎯",
    path: "/strategies",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Performance reports",
    icon: "📊",
    path: "/analytics",
  },
];

export const ROUTE_PATHS: Record<TAllTabs, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.id, item.path]),
) as Record<TAllTabs, string>;
