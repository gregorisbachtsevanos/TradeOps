import { NAV_ITEMS } from "../helpers/constants";
import { ISidebarProps } from "../types/dashboard.types";

const Sidebar = ({ activeTab, onTabChange }: ISidebarProps) => {
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
        {NAV_ITEMS.map((item) => (
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
};

export default Sidebar;
