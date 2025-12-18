// src/components/Hero.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import "./Hero.css";
import backgroundImage from "../images/herosec.webp";

const API_BASE = "https://api.ironingboy.com";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [branches, setBranches] = useState([]);
  const [popupType, setPopupType] = useState(""); // "success" or "error"
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const locationCardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Calculate popup position based on screen size
  const calculatePopupPosition = () => {
    if (locationCardRef.current) {
      const rect = locationCardRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // For mobile: position popup over the location card
        return {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          transform: 'none'
        };
      } else {
        // For desktop: center on screen
        return {
          top: '50%',
          left: '50%',
          width: 'auto',
          transform: 'translate(-50%, -50%)'
        };
      }
    }
    // Default: center on screen
    return {
      top: '50%',
      left: '50%',
      width: 'auto',
      transform: 'translate(-50%, -50%)'
    };
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickBook = () => {
    navigate("/quick-booking");
  };

  // Enhanced service availability check with new API
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
        // Service is available
        if (data.branches && data.branches.length > 0) {
          // Store branch info for quick booking
          localStorage.setItem("available_branches", JSON.stringify(data.branches));
          localStorage.setItem("search_query", location.trim());
          
          // Show success popup
          showSuccessPopup(
            "Service Available! 🎉",
            `We found ${data.branches.length} branch(es) serving your area.`,
            data.branches
          );
          
          // Auto navigate after 2 seconds if user doesn't close
          setTimeout(() => {
            if (showPopup) return; // If popup still open, don't navigate
            handleQuickBook();
          }, 2000);
        }
      } else {
        // Service not available
        showErrorPopup(
          "Service Not Available",
          data.message || `Sorry, we don't currently serve "${location.trim()}".`
        );
      }
    } catch (error) {
      console.error("Error checking service:", error);
      showErrorPopup(
        "Connection Error",
        "Unable to check service availability. Please try again later or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show success popup
  const showSuccessPopup = (title, message, branchesData) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setBranches(branchesData || []);
    setPopupType("success");
    const position = calculatePopupPosition();
    setPopupPosition(position);
    setShowPopup(true);
    
    // Scroll to popup on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const popupElement = document.querySelector('.popup-content');
        if (popupElement) {
          popupElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  // Show error popup
  const showErrorPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setBranches([]);
    setPopupType("error");
    const position = calculatePopupPosition();
    setPopupPosition(position);
    setShowPopup(true);
    
    // Scroll to popup on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const popupElement = document.querySelector('.popup-content');
        if (popupElement) {
          popupElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setPopupTitle("");
    setPopupMessage("");
    setBranches([]);
  };

  // Navigate to booking after popup
  const proceedToBooking = () => {
    closePopup();
    setTimeout(() => handleQuickBook(), 100);
  };

  const handleGetStarted = () => {
    checkServiceAvailability();
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGetStarted();
    }
  };

  const features = useMemo(
    () => [
      { icon: "👔", text: "Expert Fabric Care" },
      { icon: "🚚", text: "Free Pickup & Delivery" },
      { icon: "🧺", text: "Doorstep Collection & Drop-off" },
      { icon: "✨", text: "Premium Stain Treatment" }
    ],
    []
  );

  const discountItems = useMemo(
    () => [
      "Students get 25% OFF on any booking!",
      "Minimum top up - £20",
      "If booking amount is £50 - £100 then 15% discount",
      "If booking amount is £100 - £300 then 20% discount",
      "If booking amount is more than £300 then 22% discount",
      "Applicable on each customer's first 3 orders"
    ],
    []
  );

  return (
    <section className={`hero ${isVisible ? "visible" : ""}`}>
      {/* BACKGROUND */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      />
      <div className="hero-gradient" />

      {/* Service Availability Popup */}
      {showPopup && (
        <div className="service-availability-popup">
          <div className="popup-overlay" onClick={closePopup}></div>
          <div 
            className="popup-content"
            style={{
              position: window.innerWidth <= 768 ? 'absolute' : 'fixed',
              top: popupPosition.top,
              left: popupPosition.left,
              width: popupPosition.width,
              transform: popupPosition.transform,
              maxWidth: window.innerWidth <= 768 ? 'calc(100% - 40px)' : '500px'
            }}
          >
            <div className={`popup-header ${popupType}`}>
              <div className="popup-icon">
                {popupType === "success" ? "✅" : "⚠️"}
              </div>
              <h3>{popupTitle}</h3>
              <button className="popup-close" onClick={closePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <p>{popupMessage}</p>
              
              {popupType === "success" && branches.length > 0 && (
                <div className="available-branches">
                  <h4>Available Branches:</h4>
                  <div className="branches-list">
                    {branches.slice(0, 3).map((branch, index) => (
                      <div key={branch.id || index} className="branch-card">
                        <div className="branch-icon">🏢</div>
                        <div className="branch-info">
                          <div className="branch-name">{branch.name}</div>
                          <div className="branch-postcodes">
                            {branch.postcodes && branch.postcodes.length > 0 && (
                              <span>Serves: {branch.postcodes.slice(0, 3).join(", ")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {branches.length > 3 && (
                      <div className="branch-card more-branches">
                        <div className="branch-icon">📋</div>
                        <div className="branch-info">
                          <div className="branch-name">+{branches.length - 3} more branches</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {popupType === "error" && (
                <div className="suggestions">
                  <h4>Suggestions:</h4>
                  <ul>
                    <li>• Try entering just the postcode (e.g., "SW1A 1AA")</li>
                    <li>• Try entering the area name (e.g., "Westminster")</li>
                    <li>• Check if you're in our <button onClick={() => {
                      closePopup();
                      navigate("/areas");
                    }} className="inline-link">service areas list</button></li>
                    <li>• Contact us for expansion requests</li>
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
                    Proceed to Booking →
                  </button>
                </>
              ) : (
                <>
                  <button className="popup-btn-secondary" onClick={closePopup}>
                    Try Another Location
                  </button>
                  <button 
                    className="popup-btn-primary" 
                    onClick={() => {
                      closePopup();
                      navigate("/areas");
                    }}
                  >
                    View Service Areas
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hero-container">
        {/* LEFT SECTION — QUICK BOOKING CTA */}
        <div className="hero-left">
          <div className="hero-badge">✨ Trusted by 10,000+ Happy Customers</div>

          <h1 className="hero-title">
            <span className="title-main">Where Luxury Meets</span>
            <span className="title-type">
              <Typewriter
                words={["Freshness", "Convenience", "Perfection", "Care"]}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={60}
                deleteSpeed={45}
                delaySpeed={1500}
              />
            </span>
          </h1>

          <p className="hero-subtext">
            Experience the future of laundry care — advanced technology combined
            with premium techniques for spotless results.
          </p>

          {/* QUICK BOOKING CARD */}
          <div className="quick-wrapper">
            <div className="quick-booking-card">
              <div className="quick-tag">QUICK BOOKING</div>

              <h3 className="quick-title">Book First Order</h3>

              <p className="quick-desc">
                Quick booking lets you place an order without selecting itemized services.
                Perfect for your first laundry experience!
              </p>

              <button
                className="quick-btn"
                onClick={handleQuickBook}
                disabled={loading}
              >
                Quick Book Now <i className="fas fa-shopping-bag" />
              </button>
            </div>
          </div>

          {/* TRUST */}
          <div className="hero-trust">
            <div className="trust-item">🟢 Same-Day Service</div>
            <div className="trust-item">🛡️ Quality Guarantee</div>
            <div className="trust-item">💸 Minimum charges £20</div>
          </div>
        </div>

        {/* RIGHT SECTION — FIND SERVICE CARD */}
        <div className="hero-right">
          <div className="feature-list">
            {features.map((item, i) => (
              <div 
                className="feature-card" 
                key={i}
              >
                <div className="feature-icon">
                  {item.icon}
                </div>
                <div className="feature-text">
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div className="location-card" ref={locationCardRef}>
            <div className="location-header">
              <i className="fas fa-crosshairs" />
              <span>Find Service in Your Area</span>
            </div>

            <div className="location-input-wrap">
              <input
                type="text"
                placeholder="Enter your address or zip code..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />

              <button
                className={`location-btn ${location ? "active" : ""} ${loading ? "loading" : ""}`}
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
                    Check <i className="fas fa-arrow-right" />
                  </>
                )}
              </button>
            </div>

            <p className="location-hint">
              <i className="fas fa-info-circle" />
              Enter your location to check availability & pricing
            </p>
          </div>
        </div>
      </div>

      {/* DISCOUNT MARQUEE */}
      <div className="hero-discount-wrapper">
        <div className="hero-discount-label">Intro Discounts</div>

        <div className="hero-discount-marquee">
          <div className="discount-track">
            {discountItems.map((item, idx) => (
              <span key={`d1-${idx}`} className="discount-item">
                {item}
              </span>
            ))}
            {discountItems.map((item, idx) => (
              <span key={`d2-${idx}`} className="discount-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;