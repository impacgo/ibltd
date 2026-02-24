// src/components/FloatingCallButton.jsx
import React from "react";
import "./FloatingCallButton.css";

const FloatingCallButton = () => {
  return (
    <a
      href="tel:+442031231010"
      className="floating-call-btn"
      aria-label="Call Ironing Boy Corporate Team"
    >
      <i className="fas fa-phone-alt"></i>
      <div className="floating-call-text">
        <span className="floating-call-title">Call Us</span>
        <span className="floating-call-subtitle">
          Corporate & Bulk Enquiries
        </span>
      </div>
    </a>
  );
};

export default FloatingCallButton;
