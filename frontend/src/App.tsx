import { FormEvent, useEffect, useState } from "react";
import { useStore } from "./hooks/useStore.js";
import { useLogin, useRegister, useCurrentUser } from "./hooks/useApi.js";
import Dashboard from "./pages/Dashboard.js";
import "./App.css";
import { QueryClient } from "react-query";

type Theme = "dark" | "light";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const { user, setUser } = useStore();
  const { data: currentUserData, isLoading: isCheckingAuth } = useCurrentUser();

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (currentUserData?.data) {
      setUser(currentUserData.data);
    }
  }, [currentUserData, setUser]);

  if (isCheckingAuth) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app" data-theme={theme}>
      {!user ? (
        <LoginRegisterPage
          theme={theme}
          onThemeToggle={() =>
            setTheme((currentTheme) =>
              currentTheme === "dark" ? "light" : "dark",
            )
          }
        />
      ) : (
        <>
          <Header
            user={user}
            theme={theme}
            onThemeToggle={() =>
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
              )
            }
            onLogout={() => setUser(null)}
          />
          <Dashboard theme={theme} />
        </>
      )}
    </div>
  );
}

interface LoginRegisterPageProps {
  theme: Theme;
  onThemeToggle: () => void;
}

function LoginRegisterPage({ theme, onThemeToggle }: LoginRegisterPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("Demo User");
  const [error, setError] = useState("");

  const login = useLogin();
  const register = useRegister();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ email, password, name });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Trading Automation Platform</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            className="btn-primary"
            disabled={login.isLoading || register.isLoading}
          >
            {isLogin ? "Login" : "Register"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </form>
        <button className="btn-theme" onClick={onThemeToggle}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </div>
  );
}

interface HeaderProps {
  user: { id: string; email: string; name: string } | null;
  theme: Theme;
  onThemeToggle: () => void;
  onLogout: () => void;
}

function Header({ user, theme, onThemeToggle, onLogout }: HeaderProps) {
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    onLogout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Trading Automation Platform</h1>
        <div className="header-user">
          <button className="btn-theme" onClick={onThemeToggle}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default App;
