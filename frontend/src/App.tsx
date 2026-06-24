import { useEffect, useState } from "react";
import styles from "./App.module.css";
import AuthPage from "./features/auth/view/Auth.js";
import { useStore } from "./app/hooks/useStore.js";
import AppLayout from "./layout/AppLayout.js";
import { useCurrentUser } from "./features/auth/hooks/useAuth.js";

export type Theme = "dark" | "light";

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const { user, setUser } = useStore();
  const { data: currentUser, isLoading: isCheckingAuth } = useCurrentUser();

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  if (isCheckingAuth) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const onThemeToggle = () =>
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));

  return (
    <div className={styles.app} data-theme={theme}>
      {!user ? (
        <AuthPage theme={theme} onThemeToggle={onThemeToggle} />
      ) : (
        <AppLayout theme={theme} onThemeToggle={onThemeToggle} />
      )}
    </div>
  );
}

export default App;
