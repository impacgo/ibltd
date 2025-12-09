import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Typewriter } from "react-simple-typewriter";
import "./Hero.css";
import backgroundImage from "../images/herosec.webp";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (location.trim()) scrollToSection("services");
  };

  // Handle Quick Book navigation
  const handleQuickBook = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("ironboy_user") !== null;
    
    if (isLoggedIn) {
      // If logged in, navigate directly to quick booking
      navigate("/quick-booking");
    } else {
      // If not logged in, navigate to quick booking page which will show login popup
      navigate("/quick-booking");
      // Alternatively, you could show a login modal first, then navigate
      // But since QuickBooking component already handles login, we can navigate directly
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

      <div className="hero-container">
        {/* ----------------------------------------------
            LEFT SECTION — QUICK BOOKING CTA
        ---------------------------------------------- */}
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
              >
                Quick Book Now <i className="fas fa-shopping-bag" />
              </button>

              {/* Optional: Show login hint for non-logged in users */}
              {!localStorage.getItem("ironboy_user") && (
                <p className="quick-login-hint">
                  <i className="fas fa-info-circle"></i> Login required for booking
                </p>
              )}
            </div>
          </div>

          {/* TRUST */}
          <div className="hero-trust">
            <div className="trust-item">🟢 Same-Day Service</div>
            <div className="trust-item">🛡️ Quality Guarantee</div>
            <div className="trust-item">💸 Minimum charges £20</div>
          </div>
        </div>

        {/* ----------------------------------------------
            RIGHT SECTION — FIND SERVICE CARD
        ---------------------------------------------- */}
        <div className="hero-right">
          <div className="feature-list">
            {features.map((item, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{item.icon}</div>
                <div className="feature-text">{item.text}</div>
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
              />

              <button
                className={`location-btn ${location ? "active" : ""}`}
                onClick={handleGetStarted}
              >
                Check <i className="fas fa-arrow-right" />
              </button>
            </div>

            <p className="location-hint">
              <i className="fas fa-info-circle" />
              Enter your location to check availability & pricing
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------
          DISCOUNT MARQUEE
      ---------------------------------------------- */}
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