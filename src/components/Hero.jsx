// src/components/Hero.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const API_BASE = "https://api.ironingboy.com";

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
      showErrorPopup("Input Required", "Please enter your address or postal code.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/postcode-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: location.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Service check failed");
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("available_branches", JSON.stringify(data.branches));
        localStorage.setItem("search_query", location.trim());
        
        showSuccessPopup(
          "Service Available!",
          `We found ${data.branches.length} branch(es) serving your area.`,
          data.branches
        );
        
        setTimeout(() => {
          if (showPopup) return;
          handleQuickBook();
        }, 2000);
      } else {
        showErrorPopup(
          "Service Not Available",
          data.message || `Sorry, we don't currently serve "${location.trim()}".`
        );
      }
    } catch (error) {
      console.error("Error checking service:", error);
      showErrorPopup(
        "Connection Error",
        "Unable to check service availability. Please try again later."
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
              
              {popupType === "success" && branches.length > 0 && (
                <div className="available-branches">
                  <h4>
                    <i className="fas fa-store"></i>
                    Available Branches:
                  </h4>
                  <div className="branches-list">
                    {branches.slice(0, 2).map((branch, index) => (
                      <div key={branch.id || index} className="branch-card">
                        <div className="branch-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="branch-info">
                          <div className="branch-name">{branch.name}</div>
                          <div className="branch-distance">
                            <i className="fas fa-location-dot"></i>
                            {branch.distance ? `${branch.distance} miles away` : "Nearby"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
            <div className="location-header">
              <h2 className="location-title">Check Service Availability</h2>
              <p className="location-subtitle">Enter your postcode to see if we serve your area</p>
            </div>
            
            <div className="location-check-wrapper">
              <div className="location-input-wrapper">
                {/* <div className="input-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div> */}
                <input
                  type="text"
                  className="location-input"
                  placeholder="Enter your postcode or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  className={`location-check-btn ${location.trim() ? 'active' : ''} ${loading ? 'loading' : ''}`}
                  onClick={handleGetStarted}
                  disabled={loading || !location.trim()}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Checking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Check Availability
                    </>
                  )}
                </button>
              </div>
              <div className="location-hint">
                <i className="fas fa-info-circle"></i>
                <span>Try entering just your postcode for faster results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default Hero;