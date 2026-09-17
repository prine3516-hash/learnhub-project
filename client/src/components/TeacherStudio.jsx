import React, { useState } from "react";
import { IconPlus, IconTrash, IconBookOpen, IconUsers, IconStar, IconAward } from "./Icons";

export default function TeacherStudio({
  user,
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddLesson,
  onDeleteLesson,
  onCreateQuiz
}) {
  const [activeTab, setActiveTab] = useState("courses");

  // Form states for creating/editing courses
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: 49,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    outcomes: "Master core concepts\nBuild real projects\nAcquire certification"
  });

  // Form states for adding lessons
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?._id || "");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
    duration: "18 min",
    notes: ""
  });

  // Form states for adding quiz
  const [quizForm, setQuizForm] = useState({
    title: "Course Assessment",
    passingScore: 70,
    question: "",
    opt0: "",
    opt1: "",
    opt2: "",
    opt3: "",
    correctIndex: 0,
    explanation: ""
  });

  const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);
  const totalRevenue = courses.reduce((acc, c) => acc + (c.students || 0) * (c.price || 0), 0);

  const handleStartEdit = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category || "Development",
      level: course.level || "Beginner",
      price: course.price || 0,
      thumbnail: course.thumbnail || "",
      outcomes: Array.isArray(course.outcomes) ? course.outcomes.join("\n") : ""
    });
    setActiveTab("new-course");
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (editingCourse) {
      await onUpdateCourse(editingCourse._id, courseForm);
      setEditingCourse(null);
    } else {
      await onCreateCourse(courseForm);
    }
    setCourseForm({
      title: "",
      description: "",
      category: "Development",
      level: "Beginner",
      price: 49,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      outcomes: "Master core concepts\nBuild real projects\nAcquire certification"
    });
    setActiveTab("courses");
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    await onAddLesson(selectedCourseId, lessonForm);
    setLessonForm({
      title: "",
      description: "",
      videoUrl: "https://www.youtube.com/embed/7CqJlxBYj-M",
      duration: "18 min",
      notes: ""
    });
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !quizForm.question) return;

    const payload = {
      courseId: selectedCourseId,
      title: quizForm.title,
      passingScore: Number(quizForm.passingScore),
      questions: [
        {
          question: quizForm.question,
          options: [quizForm.opt0, quizForm.opt1, quizForm.opt2, quizForm.opt3].filter(Boolean),
          correctIndex: Number(quizForm.correctIndex),
          explanation: quizForm.explanation
        }
      ]
    };
    await onCreateQuiz(payload);
    setQuizForm({
      title: "Course Assessment",
      passingScore: 70,
      question: "",
      opt0: "",
      opt1: "",
      opt2: "",
      opt3: "",
      correctIndex: 0,
      explanation: ""
    });
  };

  return (
    <div className="dashboard-page container">
      {/* Studio Hero */}
      <div className="dashboard-hero">
        <div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Instructor Studio
          </span>
          <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Manage curriculum, publish new courses, and review student learning achievements.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingCourse(null);
            setActiveTab("new-course");
          }}
        >
          <IconPlus size={18} />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <IconBookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Active Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <IconUsers size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Students Enrolled</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <IconStar size={24} />
          </div>
          <div className="stat-info">
            <h3>4.9 ★</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <IconAward size={24} />
          </div>
          <div className="stat-info">
            <h3>${totalRevenue}</h3>
            <p>Estimated Royalties</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          My Courses ({courses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "new-course" ? "active" : ""}`}
          onClick={() => setActiveTab("new-course")}
        >
          {editingCourse ? "Edit Course" : "New Course"}
        </button>
        <button
          className={`tab-btn ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => setActiveTab("lessons")}
        >
          Lesson Manager
        </button>
        <button
          className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
          onClick={() => setActiveTab("quizzes")}
        >
          Quiz Creator
        </button>
      </div>

      {/* Tab: Courses List */}
      {activeTab === "courses" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Price</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={course.thumbnail}
                        alt=""
                        style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {course.lessons?.length || 0} lessons
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="card-category-badge" style={{ position: "static" }}>{course.category}</span></td>
                  <td>{course.level}</td>
                  <td><strong>${course.price}</strong></td>
                  <td>{course.students || 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-secondary btn-sm" onClick={() => handleStartEdit(course)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => onDeleteCourse(course._id)}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No courses created yet. Click "Create New Course" above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: New / Edit Course Form */}
      {activeTab === "new-course" && (
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>
            {editingCourse ? "Edit Course Details" : "Publish a New Course"}
          </h2>
          <form onSubmit={handleSaveCourse}>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                className="form-input"
                value={courseForm.title}
                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Modern Full-Stack Web Development"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Description</label>
              <textarea
                className="form-textarea"
                value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Comprehensive overview of what this course delivers..."
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={courseForm.category}
                  onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  <option>Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>DevOps</option>
                  <option>Business</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={courseForm.level}
                  onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>All Levels</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={courseForm.price}
                  onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                className="form-input"
                value={courseForm.thumbnail}
                onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Learning Outcomes (one per line)</label>
              <textarea
                className="form-textarea"
                value={courseForm.outcomes}
                onChange={e => setCourseForm({ ...courseForm, outcomes: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingCourse(null);
                  setActiveTab("courses");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingCourse ? "Update Course" : "Create & Launch Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Lesson Manager */}
      {activeTab === "lessons" && (
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>Add Video Lesson to Course</h2>
          <form onSubmit={handleSaveLesson}>
            <div className="form-group">
              <label className="form-label">Select Target Course</label>
              <select
                className="form-select"
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Title</label>
              <input
                className="form-input"
                value={lessonForm.title}
                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g. 1. Introduction to State Management"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Video Embed URL (YouTube or Direct)</label>
                <input
                  className="form-input"
                  value={lessonForm.videoUrl}
                  onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Duration</label>
                <input
                  className="form-input"
                  value={lessonForm.duration}
                  onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="e.g. 20 min"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Description</label>
              <input
                className="form-input"
                value={lessonForm.description}
                onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief summary of concepts learned"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructor Lecture Notes & Instructions</label>
              <textarea
                className="form-textarea"
                value={lessonForm.notes}
                onChange={e => setLessonForm({ ...lessonForm, notes: e.target.value })}
                placeholder="Important highlights, code snippets, or reference links..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary">
                <IconPlus size={16} />
                <span>Publish Lesson to Course</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Quiz Creator */}
      {activeTab === "quizzes" && (
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>Create Assessment Quiz</h2>
          <form onSubmit={handleSaveQuiz}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  className="form-input"
                  value={quizForm.title}
                  onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  className="form-input"
                  value={quizForm.passingScore}
                  onChange={e => setQuizForm({ ...quizForm, passingScore: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: "80px" }}
                value={quizForm.question}
                onChange={e => setQuizForm({ ...quizForm, question: e.target.value })}
                placeholder="e.g. Which hook should be used for handling side effects in React?"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Answer Options</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  className="form-input"
                  placeholder="Option A"
                  value={quizForm.opt0}
                  onChange={e => setQuizForm({ ...quizForm, opt0: e.target.value })}
                  required
                />
                <input
                  className="form-input"
                  placeholder="Option B"
                  value={quizForm.opt1}
                  onChange={e => setQuizForm({ ...quizForm, opt1: e.target.value })}
                  required
                />
                <input
                  className="form-input"
                  placeholder="Option C (Optional)"
                  value={quizForm.opt2}
                  onChange={e => setQuizForm({ ...quizForm, opt2: e.target.value })}
                />
                <input
                  className="form-input"
                  placeholder="Option D (Optional)"
                  value={quizForm.opt3}
                  onChange={e => setQuizForm({ ...quizForm, opt3: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Correct Answer</label>
              <select
                className="form-select"
                value={quizForm.correctIndex}
                onChange={e => setQuizForm({ ...quizForm, correctIndex: e.target.value })}
              >
                <option value={0}>Option A is Correct</option>
                <option value={1}>Option B is Correct</option>
                <option value={2}>Option C is Correct</option>
                <option value={3}>Option D is Correct</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation</label>
              <input
                className="form-input"
                placeholder="Why this answer is correct..."
                value={quizForm.explanation}
                onChange={e => setQuizForm({ ...quizForm, explanation: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary">
                <span>Save Assessment Question</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
