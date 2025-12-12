import React, { useState, useEffect, useMemo } from "react";
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
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

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
    setShowPopup(true);
  };

  // Show error popup
  const showErrorPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setBranches([]);
    setPopupType("error");
    setShowPopup(true);
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
          <div className="popup-content">
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
                    <li>• Check if you're in our service areas list</li>
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
                    Close
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
          <div className="feature-list" style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            maxWidth: "380px",
            width: "100%",
            alignSelf: "flex-start",
          }}>
            {features.map((item, i) => (
              <div 
                className="feature-card" 
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.85rem 1.1rem",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                  transition: "0.3s"
                }}
              >
                {/* Icon at the start */}
                <div 
                  className="feature-icon" 
                  style={{
                    background: "none",
                    fontSize: "1.4rem",
                    marginRight: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "1.4rem"
                  }}
                >
                  {item.icon}
                </div>
                
                {/* Text after the gap */}
                <div 
                  className="feature-text" 
                  style={{
                    color: "white",
                    fontSize: "0.95rem",
                    fontWeight: "500"
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div className="location-card">
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
                onKeyDown={(e) => e.key === "Enter" && handleGetStarted()}
                disabled={loading}
              />

              <button
                className={`location-btn ${location ? "active" : ""} ${loading ? "loading" : ""}`}
                onClick={handleGetStarted}
                disabled={loading}
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