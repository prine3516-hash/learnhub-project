import React, { useState } from "react";
import { IconClose, IconCheck, IconAward } from "./Icons";

export default function QuizModal({ quiz, onClose, onSubmitResult }) {
  const questions = quiz?.questions || [
    {
      question: "What is the primary benefit of full-stack JavaScript with MERN?",
      options: [
        "Uniform language (JS/JSON) across frontend, backend and database",
        "It only works with SQL relational tables",
        "It eliminates the need for any CSS styling",
        "It requires compiling to C++ binary"
      ],
      correctIndex: 0,
      explanation: "JavaScript and JSON pass naturally between React, Express, and MongoDB without data model impedance."
    },
    {
      question: "Which component handles HTTP requests and API routing in MERN?",
      options: ["MongoDB", "Express.js", "Redux", "Vite"],
      correctIndex: 1,
      explanation: "Express.js is the web routing and API layer running on Node.js."
    }
  ];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const feedback = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        ...q,
        selectedIndex: selected,
        isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= (quiz?.passingScore || 70);

    const res = {
      score,
      passed,
      passingScore: quiz?.passingScore || 70,
      correctCount,
      totalCount: questions.length,
      feedback
    };

    setResult(res);
    setSubmitted(true);
    if (onSubmitResult) onSubmitResult(res);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "700px" }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <IconClose size={18} />
        </button>

        <div className="quiz-container">
          <div className="quiz-header">
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
              Assessment
            </span>
            <h2 style={{ fontSize: "1.8rem", marginTop: "4px" }}>
              {quiz?.title || "Course Knowledge Check"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Passing score: {quiz?.passingScore || 70}% • {questions.length} Questions
            </p>
          </div>

          {!submitted ? (
            <div>
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="quiz-question-box">
                  <div className="quiz-question-title">
                    Question {qIdx + 1}: {q.question}
                  </div>
                  <div className="quiz-options">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={`quiz-option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelect(qIdx, optIdx)}
                        >
                          <span style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1.5px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-results-card">
              <div className={`score-badge ${result.passed ? "passed" : "failed"}`}>
                {result.score}%
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                {result.passed ? "🎉 Congratulations! You Passed!" : "Needs Improvement"}
              </h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
                You answered {result.correctCount} out of {result.totalCount} questions correctly.
                {result.passed ? " You have demonstrated strong competency!" : " Review the lessons and try again to improve your score."}
              </p>

              {/* Explanations List */}
              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {result.feedback.map((f, i) => (
                  <div key={i} style={{ padding: "16px", borderRadius: "var(--radius-md)", background: f.isCorrect ? "var(--success-bg)" : "var(--danger-bg)", border: `1px solid ${f.isCorrect ? "var(--success)" : "var(--danger)"}` }}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                      {i + 1}. {f.question}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: f.isCorrect ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {f.isCorrect ? "✓ Correct" : `✗ Your answer: ${f.selectedIndex >= 0 ? f.options[f.selectedIndex] : "No answer"}`}
                    </div>
                    {!f.isCorrect && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "4px" }}>
                        Correct answer: <strong>{f.options[f.correctIndex]}</strong>
                      </div>
                    )}
                    {f.explanation && (
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                        💡 {f.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button className="btn-secondary" onClick={handleRetry}>
                  Retry Quiz
                </button>
                <button className="btn-primary" onClick={onClose}>
                  Back to Classroom
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
