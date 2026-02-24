// src/components/CorporateServices.jsx
import React from "react";
import "./CorporateServices.css";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc0DvaW7Uiumpepic9ZuLpfCWB0651IYjFv3DvFdUH9XiecoQ/viewform";

const CorporateServices = () => {
  return (
    <section className="corporate-section">
      <div className="corporate-container">

        {/* ===== HEADER ===== */}
        <div className="corporate-header">
          <div className="corporate-badge">
            <i className="fas fa-building"></i>
            <span>Corporate Services</span>
          </div>

          <h1 className="corporate-title">
            Corporate & Bulk <span>Laundry Solutions</span>
          </h1>

          <p className="corporate-subtitle">
            Reliable laundry services for hotels, offices, gyms & businesses.
          </p>
        </div>

        {/* ===== CTA CARD ===== */}
        <div className="corporate-form-wrapper">
          <h3>Request a Corporate Quote</h3>

          <p className="corporate-cta-text">
            For corporate accounts, pricing depends on volume, frequency, and
            service requirements. Please fill out our short form and our team
            will contact you within 24 hours.
          </p>

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="corporate-submit-btn corporate-google-btn"
          >
            <i className="fas fa-file-alt"></i>
            Open Corporate Request Form
          </a>

          <p className="corporate-note">
            Prefer to speak directly? Call us at{" "}
            <a href="tel:+442031231010">+44 020 3123 1010</a>
          </p>
        </div>
      </div>

      {/* ===== BENEFITS ===== */}
      <div className="corporate-benefits">
        <h3>Why Corporate Clients Choose Us</h3>

        <ul>
          <li>Dedicated account manager</li>
          <li>Custom pricing & monthly invoicing</li>
          <li>Scheduled pickups & deliveries</li>
          <li>Commercial-grade garment care</li>
          <li>SLA-based professional service</li>
        </ul>

        <div className="corporate-highlight">
          We provide <strong>dedicated account management</strong> for all
          corporate clients.
        </div>
      </div>
    </section>
  );
};

export default CorporateServices;
