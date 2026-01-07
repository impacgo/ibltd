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
    color: "#FF6B00",
  },
  {
    id: 2,
    title: "We Collect",
    description: "Free pickup from your doorstep",
    icon: "fas fa-truck-pickup",
    color: "#FF8C00",
  },
  {
    id: 3,
    title: "Expert Cleaning",
    description: "Professional care with eco-friendly products",
    icon: "fas fa-spa",
    color: "#FF9E00",
  },
  {
    id: 4,
    title: "Fast Delivery",
    description: "Fresh clothes in 24 hours",
    icon: "fas fa-shipping-fast",
    color: "#FFB347",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleSchedulePickup = () => {
    navigate("/quick-booking");
  };

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="howitworks-container">
        {/* Header Section */}
        <div className="howitworks-header">
          <div className="howitworks-badge">
            <i className="fas fa-play-circle"></i>
            <span>Simple Process</span>
          </div>
          
          <h1 className="howitworks-title">
            How It 
            <span className="highlight"> Works</span>
          </h1>
          
          <p className="howitworks-subtitle">
            Get your laundry done in 4 easy steps. Fast, reliable, and professional service.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid-container">
          <div className="steps-background-accent"></div>
          
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.id} className="step-card-wrapper">
                <div className="step-card" data-step={index + 1}>
                  <div className="step-icon-wrapper">
                    <div 
                      className="step-icon-circle"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <i 
                        className={step.icon} 
                        style={{ color: step.color }}
                      ></i>
                    </div>
                    <div className="step-number">
                      <span>0{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                  
                  <div className="step-connector">
                    <div 
                      className="connector-line"
                      style={{ backgroundColor: `${step.color}40` }}
                    ></div>
                    {index < steps.length - 1 && (
                      <div className="connector-arrow">
                        <i 
                          className="fas fa-arrow-right" 
                          style={{ color: step.color }}
                        ></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="howitworks-cta" style={{background:"none"}}>
          <div className="cta-card" style={{background:"none",border:"1px solid #FF9E00"}} >
            <div className="cta-icon">
              <i className="fas fa-calendar"></i>
            </div>
            
            <div className="cta-content">
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of satisfied customers with our premium laundry service</p>
              
              <div className="pricing-info">
                <div className="pricing-item">
                  <div className="pricing-icon">
                    <i className="fas fa-pound-sign"></i>
                  </div>
                  <div className="pricing-details">
                    <span className="pricing-label">Minimum Order</span>
                    <span className="pricing-value">£20</span>
                  </div>
                </div>
                
                <div className="pricing-item">
                  <div className="pricing-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="pricing-details">
                    <span className="pricing-label">Service Charge</span>
                    <span className="pricing-value">£2</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cta-action">
              <button 
                className="cta-button"
                onClick={handleSchedulePickup}
              >
                <i className="fas fa-calendar-plus"></i>
                Schedule Your First Pickup
              </button>
              
              <div className="cta-assurance">
                <div className="assurance-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Quality Guaranteed</span>
                </div>
                <div className="assurance-item">
                  <i className="fas fa-clock"></i>
                  <span>24h Turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;