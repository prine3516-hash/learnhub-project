import React, { useState } from "react";
import { IconCheck, IconPlay, IconAward, IconBookOpen, IconArrowRight, IconFileText } from "./Icons";

export default function ClassroomView({
  course,
  enrollment,
  onToggleLesson,
  onOpenQuiz,
  onOpenCertificate,
  onBack
}) {
  const lessons = course?.lessons || [];
  const completedLessons = enrollment?.completedLessons || [];
  const progress = enrollment?.progress || 0;

  // Active selected lesson
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const activeLesson = lessons[activeLessonIndex] || lessons[0];

  const isCompleted = activeLesson && completedLessons.some(
    id => String(id) === String(activeLesson._id)
  );

  const handleNext = () => {
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    }
  };

  return (
    <div className="classroom-container">
      <div className="container">
        {/* Top Header */}
        <div className="classroom-header">
          <button className="back-link" onClick={onBack}>
            ← Back to Courses
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {course.title}
            </span>
            {progress === 100 && (
              <button
                className="btn-sm"
                style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning)" }}
                onClick={onOpenCertificate}
              >
                <IconAward size={16} />
                <span>Claim Certificate 🏆</span>
              </button>
            )}
          </div>
        </div>

        {/* Classroom 2-Column Grid */}
        <div className="classroom-grid">
          {/* Main Video & Content Area */}
          <div>
            <div className="video-player-card">
              <div className="video-frame-container">
                {activeLesson?.videoUrl ? (
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                    <IconPlay size={48} />
                    <p style={{ marginTop: "12px" }}>Interactive lecture content</p>
                  </div>
                )}
              </div>

              <div className="lesson-content">
                {/* Action Bar */}
                <div className="lesson-action-bar">
                  <div className="lesson-title-area">
                    <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
                      Lesson {activeLessonIndex + 1} of {lessons.length}
                    </span>
                    <h2>{activeLesson?.title || "Lesson Overview"}</h2>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      className={isCompleted ? "btn-secondary" : "btn-primary"}
                      onClick={() => onToggleLesson(activeLesson?._id, !isCompleted)}
                    >
                      <IconCheck size={16} color={isCompleted ? "var(--success)" : "#FFFFFF"} />
                      <span>{isCompleted ? "Completed ✓" : "Mark Complete"}</span>
                    </button>
                  </div>
                </div>

                {/* Lesson Description */}
                <p style={{ fontSize: "0.98rem", color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "20px" }}>
                  {activeLesson?.description || "In this lesson, you will learn hands-on implementation details and core concepts."}
                </p>

                {/* Lecture Notes */}
                {activeLesson?.notes && (
                  <div className="lesson-notes">
                    <h4>
                      <IconFileText size={18} color="var(--primary)" />
                      <span>Instructor Lecture Notes</span>
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      {activeLesson.notes}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={handlePrev}
                    disabled={activeLessonIndex === 0}
                    style={{ opacity: activeLessonIndex === 0 ? 0.5 : 1 }}
                  >
                    ← Previous Lesson
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={handleNext}
                    disabled={activeLessonIndex >= lessons.length - 1}
                    style={{ opacity: activeLessonIndex >= lessons.length - 1 ? 0.5 : 1 }}
                  >
                    <span>Next Lesson →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Syllabus */}
          <aside className="syllabus-sidebar">
            <h3 style={{ fontSize: "1.15rem", marginBottom: "16px" }}>Course Curriculum</h3>

            {/* Progress Gauge */}
            <div className="sidebar-progress-box">
              <div className="progress-info">
                <span>Course Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track" style={{ height: "10px" }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px" }}>
                {completedLessons.length} of {lessons.length} lessons finished
              </div>
            </div>

            {/* Lesson List */}
            <div className="sidebar-lessons-list">
              {lessons.map((lesson, idx) => {
                const finished = completedLessons.some(id => String(id) === String(lesson._id));
                const isActive = idx === activeLessonIndex;

                return (
                  <button
                    key={lesson._id || idx}
                    className={`sidebar-lesson-item ${isActive ? "active" : ""}`}
                    onClick={() => setActiveLessonIndex(idx)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                      <span className={`lesson-check-icon ${finished ? "completed" : ""}`}>
                        {finished ? <IconCheck size={12} /> : idx + 1}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lesson.title}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                      {lesson.duration || "15m"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Assessment Button */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn-outline"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onOpenQuiz}
              >
                <IconBookOpen size={16} />
                <span>Take Course Quiz</span>
              </button>

              {progress === 100 && (
                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #D97706, #B45309)" }}
                  onClick={onOpenCertificate}
                >
                  <IconAward size={18} />
                  <span>View Certificate</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
