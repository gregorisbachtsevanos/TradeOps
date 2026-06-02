type DashboardTab = "overview" | "trades" | "analytics";

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const navItems: Array<{
  id: DashboardTab;
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
    id: "analytics",
    label: "Analytics",
    description: "Performance reports",
    icon: "📊",
  },
];

function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">TA</div>
        <div>
          <strong>TradeOps</strong>
          <span>Automation desk</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Trading workspace">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-status">
        <span className="status-dot" />
        Mock execution bridge online
      </div>
    </aside>
  );
}

export default Sidebar;
