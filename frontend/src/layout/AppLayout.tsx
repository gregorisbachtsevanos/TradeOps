import { Theme } from "@/App";
import { useLogout } from "@/features/auth/hooks/useAuth";
import Dashboard from "@/features/Dashboard";
import { useStore } from "@/app/hooks/useStore";
import styles from "@/App.module.css";

interface AppLayoutProps {
  theme: Theme;
  onThemeToggle: () => void;
}

const AppLayout = ({ theme, onThemeToggle }: AppLayoutProps) => {
  const logout = useLogout();
  const { user, clearUser } = useStore();

  const handleLogout = async () => {
    await logout.mutateAsync();
    clearUser();
  };
  return (
    <>
      <header className={styles.header}>
        <div className={styles["header-content"]}>
          <h1>Trading Automation Platform</h1>
          <div className={styles["header-user"]}>
            <button className={styles["btn-theme"]} onClick={onThemeToggle}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <span>{user?.name}</span>
            <button onClick={handleLogout} className={styles["btn-logout"]}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <Dashboard theme={theme} />
    </>
  );
};

export default AppLayout;
