import { Theme } from "@/App";
import { FormEvent, useState } from "react";
import { useLogin, useRegister } from "../hooks/useAuth";
import styles from "../../../App.module.scss";

interface AuthPageProps {
  theme: Theme;
  onThemeToggle: () => void;
}

const AuthPage = ({ theme, onThemeToggle }: AuthPageProps) => {
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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        <h1>Trading Automation Platform</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles["form-group"]}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className={styles["form-group"]}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles["error-message"]}>{error}</div>}
          <button
            type="submit"
            className={styles["btn-primary"]}
            disabled={login.isPending || register.isPending}
          >
            {isLogin ? "Login" : "Register"}
          </button>
          <button
            type="button"
            className={styles["btn-secondary"]}
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
        <button className={styles["btn-theme"]} onClick={onThemeToggle}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
