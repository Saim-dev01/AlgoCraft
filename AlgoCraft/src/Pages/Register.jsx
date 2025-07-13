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
    "computer",
    "software",
    "it",
    "information technology",
    "cs",
    "programming",
    "coding",
    "ai",
    "artificial intelligence",
    "data science",
    "web",
    "app",
    "developer",
    "engineer",
    "cyber",
    "network",
    "machine learning",
    "algorithm",
    "computer science",
    "computer scientist",
    "informatics",
    "computing",
    "systems analyst",
    "data analyst",
    "data engineer",
    "data architect",
    "security",
    "security analyst",
    "security engineer",
    "blockchain",
    "cloud",
    "cloud computing",
    "devops",
    "full stack",
    "frontend",
    "backend",
    "ui ux",
    "ui/ux",
    "ui designer",
    "ux designer",
    "database",
    "database admin",
    "database administrator",
    "mobile developer",
    "android developer",
    "ios developer",
    "game developer",
    "game design",
    "robotics",
    "embedded systems",
    "bioinformatics",
    "quantum computing",
    "virtual reality",
    "vr",
    "ar",
    "augmented reality",
    "deep learning",
    "nlp",
    "natural language processing",
    "software tester",
    "qa",
    "quality assurance",
    "product manager",
    "scrum",
    "agile",
    "it consultant",
    "tech lead",
    "technology",
    "tech",
  ];

  const handleRegister = async (e, force = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fieldLower = field.trim().toLowerCase();
    const isComputerRelated = computerRelatedKeywords.some((keyword) =>
      fieldLower.includes(keyword)
    );
    if (!isComputerRelated && !force) {
      setLoading(false);
      setError(
        "This is an algorithm visualizer, which may not be related to your field of interest."
      );
      setShowAnyways(true);
      setPendingRegister({ name, field, email, password });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "algocraft", uid), {
        name,
        interest: field,
        email,
        createdAt: serverTimestamp(),
      });

      alert("User registered successfully!");
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
    <div className="login-wrapper">
      <div className="login-left-panel">
        <h1>Join AlgoCraft!</h1>
        <p>
          Visualize algorithms and deepen your CS knowledge. Signup to get
          started.
        </p>

        {/* Decorative triangles */}
        <div className="triangle triangle-1"></div>
        <div className="triangle triangle-2"></div>
        <div className="triangle triangle-3"></div>
      </div>

      <div className="login-right-panel">
        <div className="auth-form-container">
          <form onSubmit={handleRegister}>
            <h1>Sign Up</h1>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Field of Interest"
              value={field}
              onChange={(e) => setField(e.target.value)}
              required
            />

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

            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </button>

            {showAnyways && (
              <button
                type="button"
                style={{
                  marginTop: "0.5rem",
                  background: "#f59e42",
                  color: "#fff",
                  fontWeight: 600,
                }}
                onClick={(e) => handleRegister(e, true)}
                disabled={loading}
              >
                Sign Up Anyways
              </button>
            )}

            {error && <p>{error}</p>}

            <div className="form-footer">
              <span>Already have an account? </span>
              <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
