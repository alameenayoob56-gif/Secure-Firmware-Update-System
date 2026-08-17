  import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import "../styles/login.css";

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await login(username, password);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Login failed. Check your username and password."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="login-label">SECURE OTA SYSTEM</p>
        <h1>Administrator Login</h1>
        <p className="login-description">
          Sign in to manage firmware, devices, and deployments.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;