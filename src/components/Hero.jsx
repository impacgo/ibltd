// src/components/Hero.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const API_BASE = "https://api.ironingboy.com";

const normalizePostcode = (input) => {
  if (!input) return "";

  const cleaned = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // remove spaces & symbols

  /**
   * Extract:
   *  - 1 or 2 letters
   *  - followed by ONLY the FIRST digit
   *
   * SW6 1AG  -> SW6
   * SW66BW  -> SW6
   * W120AA  -> W12
   * E1 7AA  -> E1
   */
  const match = cleaned.match(/^([A-Z]{1,2}\d)/);

  return match ? match[1] : "";
};




const Hero = () => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [branches, setBranches] = useState([]);
  const [popupType, setPopupType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = 'visible';
    };
  }, []);

  const handleQuickBook = () => {
    navigate("/quick-booking");
  };

  const handleViewServices = () => {
    navigate("/services");
  };

 const checkServiceAvailability = async () => {
  if (!location.trim()) {
    showErrorPopup("Postcode Required", "Please enter your postcode.");
    return;
  }

  const outwardCode = normalizePostcode(location);

  if (!outwardCode) {
    showErrorPopup(
      "Invalid Postcode",
      "Please enter a valid UK postcode (e.g. SW6 or W12 0AA)."
    );
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/postcode-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: outwardCode, // ✅ only SW6 / W12
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("available_branches", JSON.stringify(data.branches));
      localStorage.setItem("search_query", outwardCode);

      showSuccessPopup(
        "Service Available 🎉",
        `Great news! We serve your area (${outwardCode}).`,
        data.branches
      );

      setTimeout(() => {
        handleQuickBook();
      }, 1200);
    } else {
      showErrorPopup(
        "Service Not Available",
        `Sorry, we don’t currently serve ${outwardCode}.`
      );
    }
  } catch (err) {
    showErrorPopup(
      "Network Error",
      "Unable to check service right now. Please try again."
    );
  } finally {
    setLoading(false);
  }
};



  const showSuccessPopup = (title, message, branchesData) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setBranches(branchesData || []);
    setPopupType("success");
    setShowPopup(true);
  };

  const showErrorPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setBranches([]);
    setPopupType("error");
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupTitle("");
    setPopupMessage("");
    setBranches([]);
  };

  const proceedToBooking = () => {
    closePopup();
    setTimeout(() => handleQuickBook(), 100);
  };

  const handleGetStarted = () => {
    checkServiceAvailability();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGetStarted();
    }
  };

  return (
    <section className="hero">
      {/* Popup */}
      {showPopup && (
        <div className="service-popup">
          <div className="popup-overlay" onClick={closePopup}></div>
          <div className="popup-content">
            <div className={`popup-header ${popupType}`}>
              <div className="popup-icon">
                {popupType === "success" ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <i className="fas fa-exclamation-circle"></i>
                )}
              </div>
              <h3>{popupTitle}</h3>
              <button className="popup-close" onClick={closePopup}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <p>{popupMessage}</p>
              
              {popupType === "success" && (
  <div className="availability-success">
    <div className="success-badge">
      <i className="fas fa-map-marker-alt"></i>
      Serving your area
    </div>

    <p className="success-text">
      We provide full laundry services in <strong>{popupMessage.match(/\((.*?)\)/)?.[1]}</strong>
    </p>
  </div>
)}

              
              {popupType === "error" && (
                <div className="suggestions">
                  <h4>
                    <i className="fas fa-lightbulb"></i>
                    Suggestions:
                  </h4>
                  <ul>
                    <li>Try entering just the postcode</li>
                    <li>Try entering the area name</li>
                    <li>Check our service areas</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="popup-footer">
              {popupType === "success" ? (
                <>
                  <button className="popup-btn-secondary" onClick={closePopup}>
                    Cancel
                  </button>
                  <button className="popup-btn-primary" onClick={proceedToBooking}>
                    <i className="fas fa-calendar-check"></i>
                    Book Now
                  </button>
                </>
              ) : (
                <>
                  <button className="popup-btn-secondary" onClick={closePopup}>
                    Try Again
                  </button>
                  <button className="popup-btn-primary" onClick={() => navigate("/areas")}>
                    <i className="fas fa-map"></i>
                    View Areas
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hero-main-content">
        <div className="hero-container">
          {/* Main Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-crown"></i>
              <span>Professional Laundry Service</span>
            </div>
            
            <h1 className="hero-title">
              Where Luxury Meets
              <span className="title-accent"> Freshness</span>
            </h1>
            
            <p className="hero-subtitle">
              Experience the future of laundry care — advanced technology combined with premium techniques for spotless results. Professional care delivered to your doorstep.
            </p>
            <div className="hero-cta-buttons">
              <button className="primary-cta" onClick={handleQuickBook}>
                <i className="fas fa-bolt"></i>
                Quick Booking
              </button>
              <button className="secondary-cta" onClick={handleViewServices}>
                <i className="fas fa-list"></i>
                View Services
              </button>
            </div>            

            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Quality</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>
            

          </div>

          {/* Services Cards */}
          <div className="services-cards">
            <div className="service-card" style={{background:" rgba(255, 255, 255, 0.08)",border:"none"}}>
              <div className="service-card-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="service-card-title">Same-Day Service</h3>
              <p className="service-card-desc">
                Get your laundry done and delivered on the same day
              </p>
            </div>

            <div className="service-card" style={{background:" rgba(255, 255, 255, 0.08)",border:"none"}}>
              <div className="service-card-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="service-card-title">Quality Guarantee</h3>
              <p className="service-card-desc">
                We guarantee the highest quality standards for every item
              </p>
            </div>

            <div className="service-card" style={{background:" rgba(255, 255, 255, 0.08)",border:"none"}}>
              <div className="service-card-icon">
                <i className="fas fa-truck"></i>
              </div>
              <h3 className="service-card-title">Free Pickup & Delivery</h3>
              <p className="service-card-desc">
                Convenient pickup and delivery at no extra cost
              </p>
            </div>

            <div className="service-card" style={{background:" rgba(255, 255, 255, 0.08)",border:"none"}}>
              <div className="service-card-icon">
                <i className="fas fa-tshirt"></i>
              </div>
              <h3 className="service-card-title">Expert Fabric Care</h3>
              <p className="service-card-desc">
                Specialized care for all fabric types and garments
              </p>
            </div>
          </div>

          {/* Location Check Section */}
          <div className="location-section">
  <div className="location-check-card">

    <div className="location-header">
      <h2 className="location-title">Check Service Availability</h2>
      <p className="location-subtitle">
        Enter your postcode to see if we serve your area
      </p>
    </div>

    <div className="location-input-group">
      <div className="input-wrapper">

        <input
          type="text"
          className="location-input-field"
          placeholder="e.g. SW6 or SW6 6BW"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          className={`location-check-button ${
            location.trim() ? "active" : ""
          } ${loading ? "loading" : ""}`}
          onClick={handleGetStarted}
          disabled={loading || !location.trim()}
        >
          {loading ? (
            <>
              <span className="loading-spinner-small"></span>
              Checking
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              Check
            </>
          )}
        </button>
      </div>

      <div className="location-input-hint">
  <i className="fas fa-info-circle"></i>
  We accept partial postcodes like <strong>SW6</strong> or <strong>W12</strong>
</div>

    </div>

  </div>
</div>

        </div>
      </div>
      
    </section>
  );
};

export default Hero;