import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { useStore } from "./hooks/useStore.js";
import Dashboard from "./pages/Dashboard.js";
import "./App.css";

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
  const { user, setUser } = useStore();

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
      <div className="app">
        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            <Header user={user} onLogout={handleLogout} />
            <Dashboard />
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
  const [password, setPassword] = useState("password");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production, validate against backend
    onLogin("user_123", email, email.split("@")[0]);
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
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

interface HeaderProps {
  user: { id: string; email: string; name: string } | null;
  onLogout: () => void;
}

function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Trading Automation Platform</h1>
        <div className="header-user">
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
