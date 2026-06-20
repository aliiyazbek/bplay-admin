import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth.service";
import { setAuthSession } from "../utils/auth.storage";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await login({
        email,
        password,
      });

      if (res?.data?.success) {
        const token = res.data.data.accessToken;
        const role = email === "test_admin@bplay.com" ? "super_admin" : "admin";
        const user = {
          email,
          role,
        };

        setAuthSession({
          accessToken: token,
          user,
          role,
        });

        navigate(role === "super_admin" ? "/app/admin-management" : "/app/profile");
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {error && (
        <p style={{ color: "red", fontSize: "13px" }}>
          {error}
        </p>
      )}

      <div className="auth-links">
        <Link to="/forgot-password">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;