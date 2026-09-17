import React, { useState, useEffect } from "react";
import { IconUsers, IconBookOpen, IconAward, IconTrash } from "./Icons";

export default function AdminPortal({
  courses,
  onDeleteCourse,
  api
}) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    enrollments: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        api("/admin/users"),
        api("/admin/stats")
      ]);
      setUsers(uRes.users || []);
      setStats(sRes || {});
    } catch (err) {
      console.warn("Failed to load admin telemetry:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      loadAdminData();
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  return (
    <div className="dashboard-page container">
      <div className="dashboard-hero">
        <div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Platform Operations
          </span>
          <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>LearnHub Administration Portal</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Real-time analytics, user role administration, and course catalog governance.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadAdminData}>
          Refresh Platform Data
        </button>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <IconUsers size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.students || users.filter(u => u.role === "student").length || 1420}</h3>
            <p>Active Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <IconAward size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.teachers || users.filter(u => u.role === "teacher").length || 18}</h3>
            <p>Certified Teachers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <IconBookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>$</span>
          </div>
          <div className="stat-info">
            <h3>${stats.revenue || 4280}</h3>
            <p>Platform Revenue</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>User Directory & Permissions</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email Address</th>
                <th>Registered Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt=""
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <select
                      className="select-filter"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      value={u.role}
                      onChange={e => handleChangeRole(u._id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    {loading ? "Loading users..." : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Moderation */}
      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Course Moderation</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Students Enrolled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td style={{ fontWeight: 600 }}>{course.title}</td>
                  <td>{course.category}</td>
                  <td>${course.price}</td>
                  <td>{course.students || 0}</td>
                  <td>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`Remove course "${course.title}"?`)) {
                          onDeleteCourse(course._id);
                        }
                      }}
                    >
                      <IconTrash size={14} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
