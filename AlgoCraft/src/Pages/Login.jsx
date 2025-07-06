// src/pages/Login.jsx
import React, { useState } from "react";
import "../style/AuthForm.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom"; // ✅

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
    const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/main"); 
      alert("Login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.98rem', color: '#555' }}>Don't have an account? </span>
          <a href="/register" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600 }}>Register</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
