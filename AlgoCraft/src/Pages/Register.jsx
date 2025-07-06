// src/pages/Register.jsx
import React, { useState } from "react";
import "../style/AuthForm.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User registered successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleRegister}>
        <h2>Signup</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Signup</button>
        {error && <p>{error}</p>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.98rem', color: '#555' }}>Already have an account? </span>
          <a href="/login" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600 }}>Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
