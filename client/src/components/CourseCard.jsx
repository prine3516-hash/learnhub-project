import React from "react";
import { IconStar, IconBookOpen, IconUsers, IconPlay, IconCheckCircle } from "./Icons";

export default function CourseCard({ course, enrollment, onSelectCourse, onStartClassroom }) {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <div className="course-card" onClick={() => onSelectCourse(course)}>
      <div className="card-media">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
          alt={course.title}
          className="card-img"
          loading="lazy"
        />
        <span className="card-category-badge">{course.category || "Development"}</span>
        <span className="card-level-badge">{course.level || "Beginner"}</span>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <div className="rating-badge">
            <IconStar size={15} />
            <span>{course.rating ? course.rating.toFixed(1) : "4.8"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <IconUsers size={14} />
            <span>{course.students || 0} students</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <IconBookOpen size={14} />
            <span>{course.lessonCount || course.lessons?.length || 0} lessons</span>
          </div>
        </div>

        <h3 className="card-title">{course.title}</h3>
        <p className="card-description">{course.description}</p>

        <div className="card-instructor">
          <div style={{ fontWeight: 600 }}>By {course.instructorName || course.instructor?.name || "LearnHub Faculty"}</div>
        </div>

        {isEnrolled ? (
          <div className="enrolled-card-progress" onClick={(e) => e.stopPropagation()}>
            <div className="progress-info">
              <span>Course Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <button
              className="btn-primary btn-sm"
              style={{ width: "100%", marginTop: "12px" }}
              onClick={() => onStartClassroom(course, enrollment)}
            >
              <IconPlay size={16} />
              <span>{progress === 100 ? "Review Classroom" : "Continue Learning"}</span>
            </button>
          </div>
        ) : (
          <div className="card-footer">
            <div className={`card-price ${course.price === 0 ? "free" : ""}`}>
              {course.price === 0 ? "Free" : `$${course.price}`}
            </div>
            <button
              className="btn-outline btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCourse(course);
              }}
            >
              View Syllabus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
