import React from "react";
import { IconClose, IconPrint, IconAward, IconCheckCircle } from "./Icons";

export default function CertificateModal({ certificate, course, user, onClose }) {
  const studentName = certificate?.studentName || user?.name || "Distinguished Graduate";
  const courseTitle = certificate?.courseTitle || course?.title || "Mastery Certification Program";
  const certId = certificate?.certificateId || `LH-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const issueDate = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "880px", background: "none", border: "none", boxShadow: "none" }} onClick={e => e.stopPropagation()}>
        <button className="modal-close btn-print-hide" onClick={onClose} style={{ top: "10px", right: "10px" }} aria-label="Close certificate">
          <IconClose size={18} />
        </button>

        <div className="certificate-wrapper">
          <div className="certificate-seal">
            <IconAward size={44} />
          </div>

          <div className="cert-header">
            <h2>Certificate of Completion</h2>
            <p>LEARNHUB ACADEMY OF ADVANCED SOFTWARE ENGINEERING</p>
          </div>

          <div className="cert-recipient">
            <p style={{ fontStyle: "italic", fontSize: "1.1rem", color: "#64748B", marginBottom: "8px" }}>
              This certifies that
            </p>
            <h3>{studentName}</h3>
          </div>

          <div className="cert-body">
            has successfully fulfilled all curriculum requirements, practical laboratories, and final assessments with highest honors in the comprehensive program:
            <div className="cert-course-title">
              "{courseTitle}"
            </div>
          </div>

          <div className="cert-footer">
            <div>
              <div className="cert-sig-line">
                <strong>Dr. Sarah Jenkins</strong><br />
                <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Academic Director</span>
              </div>
            </div>

            <div>
              <div className="cert-sig-line">
                <strong>{issueDate}</strong><br />
                <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Date Issued</span>
              </div>
            </div>

            <div>
              <div className="cert-sig-line">
                <span className="cert-id-tag">{certId}</span><br />
                <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Verification ID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print / Download Button */}
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "14px" }} className="btn-print-hide">
          <button className="btn-primary btn-lg" onClick={handlePrint}>
            <IconPrint size={20} />
            <span>Print / Save PDF Certificate</span>
          </button>
          <button className="btn-secondary btn-lg" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
