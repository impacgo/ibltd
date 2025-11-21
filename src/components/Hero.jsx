import React, { useState, useEffect, useMemo } from "react";
import { Typewriter } from "react-simple-typewriter";
import "./Hero.css";
import backgroundImage from "../images/herosec.webp";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay added to avoid load-time jitter
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (location.trim()) scrollToSection("services");
  };

  // Memoized so component doesn’t re-render unnecessary parts
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
      {/* Optimized Background */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      />
      <div className="hero-gradient" />

      <div className="hero-container">
        {/* LEFT */}
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

          {/* LOCATION CARD */}
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

          {/* TRUST */}
          <div className="hero-trust">
            <div className="trust-item">🟢 Same-Day Service</div>
            <div className="trust-item">🛡️ Quality Guarantee</div>
            <div className="trust-item">💸 Minimum charges £20</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <div className="feature-list">
            {features.map((item, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{item.icon}</div>
                <div className="feature-text">{item.text}</div>
              </div>
            ))}
          </div>

          <div className="cta-card">
            <div className="cta-tag">SPECIAL OFFER</div>
            <h3 style={{ color: "white" }}>Are You A Student?</h3>
            <p style={{ color: "white" }}>
              Get <strong>25% OFF</strong> on your order + free delivery
            </p>

            <button className="cta-btn">
              Order Now <i className="fas fa-shopping-bag" />
            </button>
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
