// src/pages/Register.jsx
import React, { useState } from "react";
import "../style/AuthForm.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAnyways, setShowAnyways] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(null);

  const computerRelatedKeywords = [
    "computer", "software", "it", "information technology", "cs", "programming", "coding", "ai", "artificial intelligence", "data science", "web", "app", "developer", "engineer", "cyber", "network", "machine learning", "algorithm",
    "computer science", "computer scientist", "informatics", "computing", "systems analyst", "data analyst", "data engineer", "data architect", "security", "security analyst", "security engineer", "blockchain", "cloud", "cloud computing", "devops", "full stack", "frontend", "backend", "ui ux", "ui/ux", "ui designer", "ux designer", "database", "database admin", "database administrator", "mobile developer", "android developer", "ios developer", "game developer", "game design", "robotics", "embedded systems", "bioinformatics", "quantum computing", "virtual reality", "vr", "ar", "augmented reality", "deep learning", "nlp", "natural language processing", "software tester", "qa", "quality assurance", "product manager", "scrum", "agile", "it consultant", "tech lead", "technology", "tech"
  ];

  const handleRegister = async (e, force = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fieldLower = field.trim().toLowerCase();
    const isComputerRelated = computerRelatedKeywords.some(keyword => fieldLower.includes(keyword));
    if (!isComputerRelated && !force) {
      setLoading(false);
      setError("This is an algorithm visualizer, which may not be related to your field of interest.");
      setShowAnyways(true);
      setPendingRegister({ name, field, email, password });
      return;
    }

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Step 2: Save additional info in Firestore under algocraft collection
      await setDoc(doc(db, "algocraft", uid), {
        name,
        interest: field,
        email,
        createdAt: serverTimestamp()
      });

      alert("User registered successfully!");

      // Clear form
      setName("");
      setField("");
      setEmail("");
      setPassword("");
      setShowAnyways(false);
      setPendingRegister(null);

    } catch (err) {
      console.error("Registration Error:", err.message);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleRegister}>
        <h2>Signup</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Field of Interest"
          value={field}
          onChange={e => setField(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>

        {showAnyways && (
          <button
            type="button"
            style={{ marginTop: '0.5rem', background: '#f59e42', color: '#fff', fontWeight: 600 }}
            onClick={e => handleRegister(e, true)}
            disabled={loading}
          >
            Signup Anyways
          </button>
        )}

        {error && <p className="error">{error}</p>}

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.98rem', color: '#555' }}>
            Already have an account?{" "}
          </span>
          <a
            href="/login"
            style={{
              color: "#6366f1",
              textDecoration: "underline",
              fontWeight: 600
            }}
          >
            Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;
