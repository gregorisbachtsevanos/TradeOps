import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../helpers/constants";
import styles from "../view/Dashboard.module.scss";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles["sidebar-brand"]}>
        <div className={styles["brand-mark"]}>TA</div>
        <div>
          <strong>TradeOps</strong>
          <span>Automation desk</span>
        </div>
      </div>

      <nav className={styles["sidebar-nav"]} aria-label="Trading workspace">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `${styles["sidebar-link"]} ${isActive ? styles.active : ""}`}
          >
            <span className={styles["sidebar-icon"]}>{item.icon}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className={styles["sidebar-status"]}>
        <span className={styles["status-dot"]} />
        Mock execution bridge online
      </div>
    </aside>
  );
};

export default Sidebar;
