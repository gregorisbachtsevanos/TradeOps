import { FormEvent, useEffect, useState } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { useStore } from "./hooks/useStore.js";
import Dashboard from "./pages/Dashboard.js";
import "./App.css";

type Theme = "dark" | "light";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const { user, setUser } = useStore();

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogin = (userId: string, userEmail: string, userName: string) => {
    setUser({ id: userId, email: userEmail, name: userName });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app" data-theme={theme}>
        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
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
              onLogout={handleLogout}
            />
            <Dashboard theme={theme} />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
}

interface LoginPageProps {
  onLogin: (userId: string, email: string, name: string) => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("mock-password");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin("user_mock_1", email, "Demo Trader");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Trading Automation Platform</h1>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn-primary">
            Enter Demo Trading Desk
          </button>
          <p className="demo-hint">
            Demo workspace uses seeded mock data from the backend JSON store.
          </p>
        </form>
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
  return (
    <header className="header">
      <div className="header-content">
        <h1>Trading Automation Platform</h1>
        <div className="header-user">
          <button className="btn-theme" onClick={onThemeToggle}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default App;
