import React, { useState } from "react";
import "../style/AuthForm.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { saveUserSession } from "../utils/userSessions";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("user", email);
      await saveUserSession("login", { email }, null, null, "User logged in");
      alert("Login session created!");
      navigate("/main");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left-panel">
        <h1>Welcome Back!</h1>
        <p>
          To keep connected with us and save your history, please login with
          your personal info.
        </p>

        {/* Triangular decorative shapes */}
        <div className="triangle triangle-1"></div>
        <div className="triangle triangle-2"></div>
        <div className="triangle triangle-3"></div>
      </div>

      <div className="login-right-panel">
        <div className="auth-form-container">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>

            {error && <p>{error}</p>}

            <div className="form-footer">
              <span>Don't have an account? </span>
              <a href="/register">Register</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
