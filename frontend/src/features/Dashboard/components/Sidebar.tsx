import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../helpers/constants";

const Sidebar = () => {
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
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </NavLink>
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
