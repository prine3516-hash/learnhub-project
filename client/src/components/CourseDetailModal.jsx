import React from "react";
import { IconClose, IconStar, IconUsers, IconBookOpen, IconCheck, IconPlay, IconAward, IconClock } from "./Icons";

export default function CourseDetailModal({
  course,
  enrollment,
  onClose,
  onEnroll,
  onStartClassroom
}) {
  if (!course) return null;

  const isEnrolled = !!enrollment;
  const lessons = course.lessons || [];
  const outcomes = course.outcomes && course.outcomes.length
    ? course.outcomes
    : [
        "Master foundational and advanced concepts in practical depth",
        "Build portfolio-worthy projects with real-world code architecture",
        "Gain verifiable certificate upon completing lessons and assessment"
      ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <IconClose size={18} />
        </button>

        {/* Hero Banner */}
        <div className="course-detail-hero">
          <div className="detail-pills">
            <span className="card-category-badge" style={{ position: "static" }}>
              {course.category || "Development"}
            </span>
            <span className="card-level-badge" style={{ position: "static" }}>
              {course.level || "Beginner"}
            </span>
          </div>

          <h1>{course.title}</h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "16px", maxWidth: "680px" }}>
            {course.description}
          </p>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", fontSize: "0.95rem" }}>
            <div className="rating-badge">
              <IconStar size={16} />
              <span>{course.rating ? course.rating.toFixed(1) : "4.8"} (Reviews)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
              <IconUsers size={16} />
              <span>{course.students || 0} students enrolled</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
              <IconBookOpen size={16} />
              <span>{lessons.length} video lectures</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="course-detail-body">
          {/* Main Info */}
          <div>
            <h3>What You'll Learn</h3>
            <ul className="outcomes-list">
              {outcomes.map((item, idx) => (
                <li key={idx} className="outcome-item">
                  <span className="outcome-check">
                    <IconCheck size={18} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3>Curriculum Syllabus</h3>
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {lessons.length} Lessons • Self-Paced
              </span>
            </div>

            <div className="curriculum-list">
              {lessons.map((lesson, idx) => (
                <div key={lesson._id || idx} className="curriculum-item">
                  <div className="curriculum-left">
                    <span className="lesson-number">{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{lesson.title}</div>
                      {lesson.description && (
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {lesson.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <IconClock size={14} />
                    <span>{lesson.duration || "15 min"}</span>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                  Curriculum modules are being finalized for this course.
                </div>
              )}
            </div>

            {/* Instructor Box */}
            <div style={{ marginTop: "36px", padding: "20px", background: "var(--bg-subtle)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Instructor
              </div>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>
                {course.instructorName || course.instructor?.name || "Dr. Sarah Jenkins"}
              </h4>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                {course.instructor?.title || "Senior Full-Stack Architect & Educator"}
              </p>
            </div>
          </div>

          {/* Right Enrollment Card */}
          <div>
            <div className="enroll-box">
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px" }}>
                Full Lifetime Access
              </div>
              <div className="enroll-price-tag">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>

              {isEnrolled ? (
                <div>
                  <div style={{ padding: "12px", background: "var(--success-bg)", color: "var(--success)", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.9rem", textAlign: "center", marginBottom: "14px" }}>
                    ✓ You are enrolled in this course
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: "100%", padding: "14px" }}
                    onClick={() => {
                      onClose();
                      onStartClassroom(course, enrollment);
                    }}
                  >
                    <IconPlay size={18} />
                    <span>Go To Classroom</span>
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px" }}
                  onClick={() => onEnroll(course)}
                >
                  <span>Enroll Now</span>
                </button>
              )}

              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IconAward size={16} color="var(--primary)" />
                  <span>Official Certificate of Completion</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IconBookOpen size={16} color="var(--primary)" />
                  <span>Interactive quizzes & assessments</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IconCheck size={16} color="var(--success)" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
