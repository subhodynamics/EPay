import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import "../styles/Login.css";

// Define the expected response shape for the login API
interface LoginResponse {
  access_token: string;
}


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { access_token } = response.data;

      // Save the token in local storage
      localStorage.setItem("jwtToken", access_token);

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (err: any) {
      // Use any to avoid AxiosError import
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="login-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;