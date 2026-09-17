import React, { useState } from "react";
import { IconClose, IconGraduationCap } from "./Icons";

export default function AuthModal({ initialMode = "login", onClose, onLoginSuccess, onDemoLogin }) {
  const [mode, setMode] = useState(initialMode); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email, password }
        : { name, email, password, role };

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
        setError("Backend server is currently offline. You can click 'Instant One-Click Demo Access' above to explore any role!");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "460px", padding: "36px" }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <IconClose size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="logo-icon" style={{ margin: "0 auto 12px" }}>
            <IconGraduationCap size={22} />
          </div>
          <h2 style={{ fontSize: "1.8rem" }}>
            {mode === "login" ? "Welcome to LearnHub" : "Create Your Account"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            {mode === "login"
              ? "Sign in to access your courses and certificates"
              : "Start learning from top industry practitioners today"}
          </p>
        </div>

        {/* Quick Demo Buttons */}
        <div style={{ background: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", textAlign: "center" }}>
            Instant One-Click Demo Access
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                onDemoLogin("student");
                onClose();
              }}
            >
              🧑‍🎓 Student
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                onDemoLogin("teacher");
                onClose();
              }}
            >
              👩‍🏫 Teacher
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                onDemoLogin("admin");
                onClose();
              }}
            >
              ⚙️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "16px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. learner@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">I want to join as</label>
              <select
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="student">Student (Learn & earn certificates)</option>
                <option value="teacher">Instructor (Create & publish courses)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                style={{ background: "none", color: "var(--primary)", fontWeight: 700 }}
                onClick={() => {
                  setError("");
                  setMode("register");
                }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                style={{ background: "none", color: "var(--primary)", fontWeight: 700 }}
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
