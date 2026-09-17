import React from "react";
import { IconGraduationCap, IconSun, IconMoon, IconLogOut, IconAward } from "./Icons";

export default function Navbar({
  user,
  activeView,
  setActiveView,
  onLogout,
  theme,
  toggleTheme,
  onDemoLogin,
  onOpenAuth
}) {
  return (
    <>
      {/* Quick Demo Switcher Bar */}
      <div className="demo-bar">
        <div className="container demo-bar-inner">
          <div className="demo-tag">
            <IconGraduationCap size={16} />
            <span>Try LearnHub Role Demos:</span>
          </div>
          <div className="demo-buttons">
            <button className="demo-btn" onClick={() => onDemoLogin("student")}>
              🧑‍🎓 Student (Alex)
            </button>
            <button className="demo-btn" onClick={() => onDemoLogin("teacher")}>
              👩‍🏫 Instructor (Dr. Sarah)
            </button>
            <button className="demo-btn" onClick={() => onDemoLogin("admin")}>
              ⚙️ Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation */}
      <nav className="navbar">
        <div className="container nav-wrapper">
          {/* Logo */}
          <button className="logo-brand" onClick={() => setActiveView("home")}>
            <div className="logo-icon">
              <IconGraduationCap size={24} />
            </div>
            <span>LearnHub</span>
          </button>

          {/* Navigation Links */}
          <div className="nav-links">
            <button
              className={`nav-btn ${activeView === "home" ? "active" : ""}`}
              onClick={() => setActiveView("home")}
            >
              Home
            </button>
            <button
              className={`nav-btn ${activeView === "courses" ? "active" : ""}`}
              onClick={() => setActiveView("courses")}
            >
              Explore Courses
            </button>

            {user && (
              <button
                className={`nav-btn ${activeView === "learning" ? "active" : ""}`}
                onClick={() => setActiveView("learning")}
              >
                My Learning
              </button>
            )}

            {user?.role === "teacher" && (
              <button
                className={`nav-btn ${activeView === "teacher" ? "active" : ""}`}
                onClick={() => setActiveView("teacher")}
              >
                Teacher Studio
              </button>
            )}

            {user?.role === "admin" && (
              <button
                className={`nav-btn ${activeView === "admin" ? "active" : ""}`}
                onClick={() => setActiveView("admin")}
              >
                Admin Portal
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Theme Toggle Button */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="user-pill"
                  title="Click to view profile"
                  onClick={() => setActiveView("profile")}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user.name}
                    className="user-avatar"
                  />
                  <span>{user.name.split(" ")[0]}</span>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  className="btn-danger btn-sm"
                  onClick={onLogout}
                  title="Sign out"
                >
                  <IconLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenAuth("login")}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onOpenAuth("register")}
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
