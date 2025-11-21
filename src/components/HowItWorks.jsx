// src/components/HowItWorks.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    id: 1,
    title: "Schedule Pickup",
    description: "Book in 2 minutes via app or website",
    icon: "fas fa-calendar-check",
  },
  {
    id: 2,
    title: "We Collect",
    description: "Free pickup from your doorstep",
    icon: "fas fa-truck-pickup",
  },
  {
    id: 3,
    title: "Expert Cleaning",
    description: "Professional care with eco-friendly products",
    icon: "fas fa-spa",
  },
  {
    id: 4,
    title: "Fast Delivery",
    description: "Fresh clothes in 24 hours",
    icon: "fas fa-shipping-fast",
  },
];

const pricingFeatures = [
  {
    icon: "fas fa-pound-sign",
    text: "Minimum order £20",
  },
  {
    icon: "fas fa-clock",
    text: "24-hour turnaround",
  },
  {
    icon: "fas fa-truck",
    text: "Free pickup & delivery",
  },
  {
    icon: "fas fa-leaf",
    text: "Eco-friendly products",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleSchedulePickup = () => {
    navigate("/coming-soon", {
      state: {
        title: "Booking System Coming Soon",
        description:
          "We're building an intuitive booking system to make scheduling your laundry pickup effortless and convenient.",
        featureName: "Online Booking System",
        expectedTime: "2-3 weeks",
      },
    });
  };

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="content-container">
        {/* Header Section */}
        <div className="section-header">
          <div className="section-badge">
            <span>Simple Process</span>
          </div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Get your laundry done in 4 easy steps. Fast, reliable, and
            professional service.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={step.id} className="step-item">
              <div className="step-number">
                <span>0{index + 1}</span>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <i className={step.icon}></i>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-card">
            <div className="cta-content">
              <h3>Ready to Get Started?</h3>
              <p>Join thousands of satisfied customers</p>

              <div className="pricing-reminder">
                <div className="minimum-badge">
                  <i className="fas fa-tag"></i>
                  <span>
                    Minimum Order: <strong>£20</strong>
                  </span>
                </div>
              </div>

              <button
                className="cta-button"
                onClick={handleSchedulePickup}
                style={{
                  background: "linear-gradient(135deg, #FF8C00, #FF6B00)",
                }}
              >
                <i className="fas fa-bolt"></i>
                Schedule Your First Pickup
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
