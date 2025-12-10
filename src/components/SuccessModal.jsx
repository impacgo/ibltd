import React from "react";
import "./SuccessModal.css";

export default function SuccessModal({ open, title, subtitle }) {
  if (!open) return null;
  return (
    <div className="sm-backdrop" role="dialog" aria-modal="true">
      <div className="sm-card">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
