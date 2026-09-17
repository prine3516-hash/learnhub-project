import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import CourseCard from "./components/CourseCard";
import CourseDetailModal from "./components/CourseDetailModal";
import ClassroomView from "./components/ClassroomView";
import QuizModal from "./components/QuizModal";
import CertificateModal from "./components/CertificateModal";
import TeacherStudio from "./components/TeacherStudio";
import AdminPortal from "./components/AdminPortal";
import AuthModal from "./components/AuthModal";
import { fallbackCourses } from "./mockData";
import {
  IconGraduationCap,
  IconSearch,
  IconBookOpen,
  IconAward,
  IconPlay,
  IconUsers,
  IconStar,
  IconCheckCircle,
  IconArrowRight
} from "./components/Icons";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function App() {
  // Theme: light / dark
  const [theme, setTheme] = useState(() => localStorage.getItem("learnhub_theme") || "light");

  // User auth state
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("learnhub_user") || "null");
    } catch {
      return null;
    }
  });

  // Active view: 'home' | 'courses' | 'learning' | 'classroom' | 'teacher' | 'admin' | 'profile'
  const [activeView, setActiveView] = useState("home");

  // Data states
  const [courses, setCourses] = useState(fallbackCourses);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Active selections & modals
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classroomData, setClassroomData] = useState(null); // { course, enrollment }
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeCert, setActiveCert] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("learnhub_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Generic API Client
  const api = async (endpoint, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = localStorage.getItem("learnhub_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  // Fetch Courses
  const loadCourses = async () => {
    try {
      const data = await api("/courses");
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    } catch (err) {
      console.warn("Using fallback courses. Server loading...", err.message);
    }
  };

  // Fetch Enrollments & Certificates for logged-in user
  const loadUserData = async () => {
    if (!user) {
      setEnrollments([]);
      setCertificates([]);
      return;
    }

    try {
      const [eRes, cRes] = await Promise.all([
        api("/enrollments/me").catch(() => ({ enrollments: [] })),
        api("/certificates/me").catch(() => ({ certificates: [] }))
      ]);
      setEnrollments(eRes.enrollments || []);
      setCertificates(cRes.certificates || []);
    } catch (err) {
      console.warn("Failed to load user enrollments:", err.message);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Handle Login Success
  const handleLoginSuccess = (token, loggedInUser) => {
    localStorage.setItem("learnhub_token", token);
    localStorage.setItem("learnhub_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    showToast(`Welcome, ${loggedInUser.name}!`);
    if (loggedInUser.role === "teacher") {
      setActiveView("teacher");
    } else if (loggedInUser.role === "admin") {
      setActiveView("admin");
    } else {
      setActiveView("learning");
    }
  };

  // Quick Demo Login
  const handleDemoLogin = async (role) => {
    try {
      const res = await api("/auth/demo", {
        method: "POST",
        body: JSON.stringify({ role })
      });
      handleLoginSuccess(res.token, res.user);
    } catch (err) {
      // Graceful demo fallback for GitHub Pages and devices without active backend
      const demoAccounts = {
        student: { _id: "u_demo_student", name: "Alex Rivera", email: "student@learnhub.com", role: "student" },
        teacher: { _id: "u_demo_teacher", name: "Dr. Sarah Jenkins", email: "teacher@learnhub.com", role: "teacher" },
        admin: { _id: "u_demo_admin", name: "LearnHub Admin", email: "admin@learnhub.com", role: "admin" }
      };
      const demoUser = demoAccounts[role] || demoAccounts.student;
      handleLoginSuccess(`demo-token-${role}`, demoUser);
      showToast(`Signed in as ${demoUser.name} (Demo Mode)`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("learnhub_token");
    localStorage.removeItem("learnhub_user");
    setUser(null);
    setEnrollments([]);
    setCertificates([]);
    setActiveView("home");
    showToast("Successfully signed out.", "info");
  };

  // Enroll in Course
  const handleEnroll = async (course) => {
    if (!user) {
      setAuthModal("login");
      return;
    }

    try {
      const res = await api("/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId: course._id })
      });
      showToast(`Enrolled in "${course.title}"!`);
      setSelectedCourse(null);
      await loadUserData();
      // Directly start classroom
      setClassroomData({
        course: res.course || course,
        enrollment: res
      });
      setActiveView("classroom");
    } catch (err) {
      // Resilient fallback for standalone preview
      const localEnrollment = {
        _id: `enr_${course._id}`,
        course: course,
        completedLessons: [],
        progressPercent: 0,
        createdAt: new Date().toISOString()
      };
      setEnrollments(prev => [...prev.filter(e => String(e.course?._id || e.course) !== String(course._id)), localEnrollment]);
      showToast(`Enrolled in "${course.title}"!`);
      setSelectedCourse(null);
      setClassroomData({
        course: course,
        enrollment: localEnrollment
      });
      setActiveView("classroom");
    }
  };

  // Toggle Lesson Completion in Classroom
  const handleToggleLesson = async (lessonId, completed) => {
    if (!classroomData?.enrollment) return;

    try {
      const res = await api(`/progress/${classroomData.enrollment._id}`, {
        method: "PUT",
        body: JSON.stringify({ lessonId, completed })
      });

      setClassroomData(prev => ({
        ...prev,
        enrollment: res.enrollment
      }));

      await loadUserData();

      if (res.certificate) {
        showToast("🎉 100% Progress! Certificate Unlocked!", "success");
        setActiveCert(res.certificate);
      } else {
        showToast(res.message);
      }
    } catch (err) {
      // Local progress fallback
      const currentCompleted = classroomData.enrollment.completedLessons || [];
      const newCompleted = completed
        ? Array.from(new Set([...currentCompleted, lessonId]))
        : currentCompleted.filter(id => id !== lessonId);

      const totalLessons = classroomData.course?.lessons?.length || 1;
      const progressPercent = Math.round((newCompleted.length / totalLessons) * 100);

      const updatedEnrollment = {
        ...classroomData.enrollment,
        completedLessons: newCompleted,
        progressPercent
      };

      setClassroomData(prev => ({ ...prev, enrollment: updatedEnrollment }));
      setEnrollments(prev => prev.map(e => e._id === updatedEnrollment._id ? updatedEnrollment : e));

      if (progressPercent === 100) {
        const cert = {
          _id: `cert_${Date.now()}`,
          certificateId: `LH-${Date.now().toString(36).toUpperCase()}`,
          course: classroomData.course,
          user: user,
          issuedAt: new Date().toISOString()
        };
        setCertificates(prev => [...prev.filter(c => String(c.course?._id || c.course) !== String(classroomData.course?._id)), cert]);
        showToast("🎉 100% Progress! Certificate Unlocked!", "success");
        setActiveCert(cert);
      } else {
        showToast(completed ? "Lesson marked complete!" : "Lesson marked incomplete");
      }
    }
  };

  // Teacher actions
  const handleCreateCourse = async (courseData) => {
    try {
      await api("/courses", {
        method: "POST",
        body: JSON.stringify(courseData)
      });
      showToast("Course created successfully!");
      loadCourses();
    } catch (err) {
      const newCourse = {
        _id: `c_${Date.now()}`,
        ...courseData,
        instructorName: user?.name || "Dr. Sarah Jenkins",
        rating: 5.0,
        students: 0,
        lessons: [],
        quizzes: []
      };
      setCourses(prev => [newCourse, ...prev]);
      showToast("Course created successfully!");
    }
  };

  const handleUpdateCourse = async (courseId, courseData) => {
    try {
      await api(`/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(courseData)
      });
      showToast("Course updated!");
      loadCourses();
    } catch (err) {
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, ...courseData } : c));
      showToast("Course updated!");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api(`/courses/${courseId}`, { method: "DELETE" });
      showToast("Course deleted.");
      loadCourses();
    } catch (err) {
      setCourses(prev => prev.filter(c => c._id !== courseId));
      showToast("Course removed.");
    }
  };

  const handleAddLesson = async (courseId, lessonData) => {
    try {
      await api(`/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(lessonData)
      });
      showToast("Lesson added!");
      loadCourses();
    } catch (err) {
      const newLesson = { _id: `l_${Date.now()}`, ...lessonData };
      setCourses(prev => prev.map(c => {
        if (c._id === courseId) {
          return { ...c, lessons: [...(c.lessons || []), newLesson] };
        }
        return c;
      }));
      showToast("Lesson added to course!");
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await api("/quizzes", {
        method: "POST",
        body: JSON.stringify(quizData)
      });
      showToast("Assessment quiz added!");
      loadCourses();
    } catch (err) {
      const newQuiz = { _id: `q_${Date.now()}`, ...quizData };
      setCourses(prev => prev.map(c => {
        if (c._id === quizData.courseId) {
          return { ...c, quizzes: [...(c.quizzes || []), newQuiz] };
        }
        return c;
      }));
      showToast("Assessment quiz added!");
    }
  };

  // Filtered & Sorted Courses
  const categories = useMemo(() => {
    return ["All", "Development", "Data Science", "Design", "DevOps", "Business"];
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchCat = selectedCategory === "All" || (c.category || "").toLowerCase() === selectedCategory.toLowerCase();
      const matchLevel = selectedLevel === "All" || (c.level || "").toLowerCase() === selectedLevel.toLowerCase();
      const matchSearch = !searchQuery || (
        (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.instructorName || c.instructor?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchCat && matchLevel && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      return (b.students || 0) - (a.students || 0);
    });
  }, [courses, selectedCategory, selectedLevel, searchQuery, sortBy]);

  // Find enrollment for a course
  const getEnrollmentForCourse = (courseId) => {
    return enrollments.find(e => String(e.course?._id || e.course) === String(courseId));
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        onDemoLogin={handleDemoLogin}
        onOpenAuth={mode => setAuthModal(mode)}
      />

      {/* Main View Router */}
      <div className="main-content">
        {/* VIEW 1: HOME */}
        {activeView === "home" && (
          <div>
            {/* Hero Section */}
            <section className="hero">
              <div className="container hero-grid">
                <div>
                  <div className="hero-badge">
                    <IconGraduationCap size={18} />
                    <span>NEXT-GEN MERN LEARNING ECOSYSTEM</span>
                  </div>
                  <h1>
                    Learn today.<br />
                    <span className="gradient-text">Build the future.</span>
                  </h1>
                  <p className="hero-p">
                    Master Web Development, AI, Cloud Architecture, and Product Design with interactive video classrooms, real code labs, and accredited credentials.
                  </p>

                  <div className="hero-cta">
                    <button
                      className="btn-primary btn-lg"
                      onClick={() => setActiveView("courses")}
                    >
                      <IconBookOpen size={18} />
                      <span>Explore All Courses</span>
                    </button>
                    {!user && (
                      <button
                        className="btn-secondary btn-lg"
                        onClick={() => setAuthModal("register")}
                      >
                        <span>Join Free</span>
                      </button>
                    )}
                  </div>

                  <div className="hero-stats">
                    <div className="hero-stat-item">
                      <h4>15,000+</h4>
                      <p>Active Learners</p>
                    </div>
                    <div className="hero-stat-item">
                      <h4>4.9 ★</h4>
                      <p>Student Satisfaction</p>
                    </div>
                    <div className="hero-stat-item">
                      <h4>98%</h4>
                      <p>Completion Success</p>
                    </div>
                  </div>
                </div>

                {/* Hero Preview Visual Card */}
                <div className="hero-visual">
                  <div className="hero-card-preview">
                    <img
                      src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80"
                      alt="Full-Stack Web Development"
                      style={{ borderRadius: "var(--radius-md)", marginBottom: "16px", height: "200px", width: "100%", objectFit: "cover" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="card-category-badge" style={{ position: "static" }}>Development</span>
                      <div className="rating-badge">
                        <IconStar size={14} />
                        <span>4.9 (1,420 students)</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>
                      Full-Stack Web Development with MERN
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      React, Node.js, Express, and MongoDB production architecture with authentication and deployment.
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="card-price">$49</div>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => {
                          const c = courses.find(x => x.title.includes("MERN")) || courses[0];
                          setSelectedCourse(c);
                        }}
                      >
                        Start Learning →
                      </button>
                    </div>
                  </div>

                  <div className="hero-floating-badge">
                    <div className="floating-icon">
                      <IconAward size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Verifiable Certificate</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Earn accredited diplomas</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Courses Section */}
            <section className="section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Popular Programs</h2>
                    <p className="section-subtitle">
                      Explore top-rated courses taught by world-class industry engineers and designers.
                    </p>
                  </div>
                  <button
                    className="btn-outline"
                    onClick={() => setActiveView("courses")}
                  >
                    <span>View All ({courses.length})</span>
                    <IconArrowRight size={16} />
                  </button>
                </div>

                {/* Course Grid */}
                <div className="course-grid">
                  {filteredCourses.slice(0, 3).map(course => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      enrollment={getEnrollmentForCourse(course._id)}
                      onSelectCourse={c => setSelectedCourse(c)}
                      onStartClassroom={(c, e) => {
                        setClassroomData({ course: c, enrollment: e });
                        setActiveView("classroom");
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Platform Features Grid */}
            <section className="section" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
              <div className="container">
                <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 48px" }}>
                  <h2 className="section-title">Designed for Modern Learning</h2>
                  <p className="section-subtitle">
                    Everything you need to master in-demand technical skills from your browser.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
                  <div style={{ padding: "32px", background: "var(--bg-subtle)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                      <IconPlay size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "10px" }}>HD Video Classroom</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                      Crystal clear video lessons with instructor notes, chapter navigation, and progress tracking.
                    </p>
                  </div>

                  <div style={{ padding: "32px", background: "var(--bg-subtle)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--accent-light)", color: "var(--accent)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                      <IconBookOpen size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "10px" }}>Interactive Assessments</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                      Evaluate your understanding with instant quiz evaluations, scoring, and answer explanations.
                    </p>
                  </div>

                  <div style={{ padding: "32px", background: "var(--bg-subtle)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--warning-bg)", color: "var(--warning)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                      <IconAward size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "10px" }}>Verifiable Credentials</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                      Earn unique, print-ready certificates of completion with secure verification IDs for your resume and LinkedIn.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: FULL COURSES CATALOG */}
        {activeView === "courses" && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <h1 className="section-title">Explore Courses</h1>
                  <p className="section-subtitle">
                    Find the perfect program to advance your development, design, and AI career.
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="search-input-wrapper">
                  <span className="search-icon">
                    <IconSearch size={18} />
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by topic, skill, or instructor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <select
                    className="select-filter"
                    value={selectedLevel}
                    onChange={e => setSelectedLevel(e.target.value)}
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <select
                    className="select-filter"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="category-pills">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Course Grid */}
              <div className="course-grid">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    enrollment={getEnrollmentForCourse(course._id)}
                    onSelectCourse={c => setSelectedCourse(c)}
                    onStartClassroom={(c, e) => {
                      setClassroomData({ course: c, enrollment: e });
                      setActiveView("classroom");
                    }}
                  />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                  <h3>No matching courses found</h3>
                  <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                    Try adjusting your search terms or category filters.
                  </p>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: "16px" }}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedLevel("All");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW 3: STUDENT MY LEARNING */}
        {activeView === "learning" && (
          <div className="dashboard-page container">
            <div className="dashboard-hero">
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Student Dashboard
                </span>
                <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>
                  Welcome, {user?.name}!
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                  Track your learning progress, resume coursework, and view earned certificates.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setActiveView("courses")}
              >
                <IconSearch size={18} />
                <span>Browse Course Library</span>
              </button>
            </div>

            {/* Learning Stats */}
            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <IconBookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h3>{enrollments.length}</h3>
                  <p>Courses Enrolled</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <IconCheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>{enrollments.filter(e => e.progress === 100).length}</h3>
                  <p>Completed Courses</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber">
                  <IconStar size={24} />
                </div>
                <div className="stat-info">
                  <h3>
                    {enrollments.length
                      ? Math.round(enrollments.reduce((a, b) => a + (b.progress || 0), 0) / enrollments.length)
                      : 0}%
                  </h3>
                  <p>Average Progress</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <IconAward size={24} />
                </div>
                <div className="stat-info">
                  <h3>{certificates.length}</h3>
                  <p>Certificates Earned</p>
                </div>
              </div>
            </div>

            {/* Active Enrolled Courses */}
            <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Enrolled Programs</h2>
            {enrollments.length > 0 ? (
              <div className="course-grid" style={{ marginBottom: "48px" }}>
                {enrollments.map(enr => {
                  const course = enr.course || courses.find(c => String(c._id) === String(enr.course));
                  if (!course) return null;

                  return (
                    <CourseCard
                      key={enr._id}
                      course={course}
                      enrollment={enr}
                      onSelectCourse={c => setSelectedCourse(c)}
                      onStartClassroom={(c, e) => {
                        setClassroomData({ course: c, enrollment: e });
                        setActiveView("classroom");
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", marginBottom: "48px" }}>
                <h3>You are not enrolled in any courses yet.</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                  Explore our curriculum to start learning today.
                </p>
                <button
                  className="btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => setActiveView("courses")}
                >
                  Explore Courses
                </button>
              </div>
            )}

            {/* Earned Certificates Shelf */}
            <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Earned Certificates & Credentials</h2>
            {certificates.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {certificates.map(cert => (
                  <div
                    key={cert._id}
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--warning)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>
                        <IconAward size={18} />
                        <span>VERIFIED CERTIFICATE</span>
                      </div>
                      <h4 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>
                        {cert.courseTitle || cert.course?.title || "Mastery Certification"}
                      </h4>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        ID: {cert.certificateId}
                      </div>
                    </div>
                    <button
                      className="btn-outline btn-sm"
                      style={{ marginTop: "20px", width: "100%", justifyContent: "center" }}
                      onClick={() => setActiveCert(cert)}
                    >
                      <span>View & Print Diploma</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "32px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Complete 100% of any course lessons or pass the course quiz to unlock your official verified certificate!
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: CLASSROOM */}
        {activeView === "classroom" && classroomData && (
          <ClassroomView
            course={classroomData.course}
            enrollment={classroomData.enrollment}
            onToggleLesson={handleToggleLesson}
            onOpenQuiz={() => {
              const q = classroomData.course?.quizzes?.[0] || {
                title: `${classroomData.course.title} Assessment`,
                passingScore: 70
              };
              setActiveQuiz(q);
            }}
            onOpenCertificate={() => {
              const cert = certificates.find(c => String(c.course) === String(classroomData.course._id)) || {
                studentName: user?.name,
                courseTitle: classroomData.course.title,
                issuedAt: new Date()
              };
              setActiveCert(cert);
            }}
            onBack={() => setActiveView("learning")}
          />
        )}

        {/* VIEW 5: TEACHER STUDIO */}
        {activeView === "teacher" && user?.role === "teacher" && (
          <TeacherStudio
            user={user}
            courses={courses}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddLesson={handleAddLesson}
            onDeleteLesson={id => api(`/lessons/${id}`, { method: "DELETE" }).then(loadCourses)}
            onCreateQuiz={handleCreateQuiz}
          />
        )}

        {/* VIEW 6: ADMIN PORTAL */}
        {activeView === "admin" && user?.role === "admin" && (
          <AdminPortal
            courses={courses}
            onDeleteCourse={handleDeleteCourse}
            api={api}
          />
        )}

        {/* VIEW 7: USER PROFILE */}
        {activeView === "profile" && user && (
          <div className="container" style={{ padding: "60px 0" }}>
            <div className="form-card">
              <h2 style={{ marginBottom: "20px" }}>My Learning Profile</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt=""
                  style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <h3>{user.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{user.email}</p>
                  <span className={`role-badge role-${user.role}`} style={{ marginTop: "6px", display: "inline-block" }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const name = e.target.elements.name.value;
                const title = e.target.elements.title.value;
                const bio = e.target.elements.bio.value;
                try {
                  const res = await api("/users/me", {
                    method: "PUT",
                    body: JSON.stringify({ name, title, bio })
                  });
                  localStorage.setItem("learnhub_user", JSON.stringify(res.user));
                  setUser(res.user);
                  showToast("Profile updated successfully!");
                } catch (err) {
                  showToast(err.message, "error");
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="name" defaultValue={user.name} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Headline / Title</label>
                  <input className="form-input" name="title" defaultValue={user.title || "Full-Stack Enthusiast"} />
                </div>
                <div className="form-group">
                  <label className="form-label">Biography</label>
                  <textarea className="form-textarea" name="bio" defaultValue={user.bio || ""} placeholder="Share your learning background..." />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", padding: "40px 0 24px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="logo-icon" style={{ width: "32px", height: "32px" }}>
              <IconGraduationCap size={18} />
            </div>
            <strong style={{ fontSize: "1.1rem" }}>LearnHub LMS</strong>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Built with MERN (MongoDB, Express, React, Node.js) • Next-Gen Learning
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          enrollment={getEnrollmentForCourse(selectedCourse._id)}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnroll}
          onStartClassroom={(c, e) => {
            setClassroomData({ course: c, enrollment: e });
            setActiveView("classroom");
          }}
        />
      )}

      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onSubmitResult={res => {
            if (res.passed) {
              showToast("🎉 Passed assessment!", "success");
            }
          }}
        />
      )}

      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          user={user}
          onClose={() => setActiveCert(null)}
        />
      )}

      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
          onLoginSuccess={handleLoginSuccess}
          onDemoLogin={handleDemoLogin}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: "none", color: "var(--text-muted)", marginLeft: "8px", fontSize: "1.1rem" }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
