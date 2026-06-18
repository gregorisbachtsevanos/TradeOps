import { Theme } from "@/App";
import { useLogout } from "@/features/auth/hooks/useAuth";
import Dashboard from "@/features/Dashboard";
import { useStore } from "@/app/hooks/useStore";

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
      <header className="header">
        <div className="header-content">
          <h1>Trading Automation Platform</h1>
          <div className="header-user">
            <button className="btn-theme" onClick={onThemeToggle}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">
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
