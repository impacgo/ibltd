// src/components/ServiceAreas.jsx
import React, { useState } from "react";
import "./ServiceAreas.css";

const areas = [
  { 
    name: "Paddington", 
    postcodes: ["W2"],
    position: { top: "42%", left: "48%" },
    description: "Central London hub near Paddington Station"
  },
  { 
    name: "Notting Hill", 
    postcodes: ["W11"],
    position: { top: "45%", left: "44%" },
    description: "Famous for Portobello Road Market"
  },
  { 
    name: "Kensington", 
    postcodes: ["W8", "SW7"],
    position: { top: "48%", left: "47%" },
    description: "Royal borough with museums & gardens"
  },
  { 
    name: "Earls Court", 
    postcodes: ["SW5"],
    position: { top: "52%", left: "47%" },
    description: "Residential area with exhibition center"
  },
  { 
    name: "Chelsea", 
    postcodes: ["SW3", "SW10"],
    position: { top: "52%", left: "49%" },
    description: "Upscale area with King's Road"
  },
  { 
    name: "Fulham", 
    postcodes: ["SW6"],
    position: { top: "55%", left: "47%" },
    description: "Riverside area with Fulham Palace"
  },
  { 
    name: "Hammersmith", 
    postcodes: ["W6"],
    position: { top: "52%", left: "42%" },
    description: "Thames-side location with bridge"
  },
  { 
    name: "Shepherd's Bush", 
    postcodes: ["W12", "W14"],
    position: { top: "48%", left: "40%" },
    description: "Home to Westfield shopping center"
  },
];

const ServiceAreas = () => {
  const [activeArea, setActiveArea] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    // ⭐⭐⭐ ADDED ID FOR SCROLLING FROM HERO ⭐⭐⭐
    <section id="serviceAreas" className="service-areas-section">
      <div className="areas-container">
        <div className="section-header">
          <h2 className="section-title">Our Service Coverage</h2>
          <p className="section-subtitle">
            Premium laundry service across West London's most sought-after neighborhoods
          </p>
        </div>

        <div className="map-content">
          <div className="london-map-container">
            <div className="map-wrapper">

              {/* STATIC MAP */}
              <div className="london-map-static">
                <img 
                  src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                  alt="West London Map"
                  className="static-map"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />

                {/* SVG FALLBACK */}
                <div className="svg-map-fallback">
                  <svg viewBox="0 0 800 500" className="london-svg-map">
                    <rect width="800" height="500" fill="#1a2d6d" />

                    <path 
                      d="M 200,250 Q 300,240 400,245 Q 500,250 600,255 L 650,260 L 650,270 L 600,265 Q 500,260 400,255 Q 300,250 200,260 Z" 
                      fill="#4A90E2" 
                      opacity="0.6"
                    />

                    <circle cx="380" cy="210" r="25" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="350" cy="225" r="20" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="370" cy="240" r="22" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="370" cy="260" r="18" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="390" cy="260" r="19" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="370" cy="275" r="16" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="330" cy="260" r="17" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />
                    <circle cx="320" cy="240" r="15" fill="rgba(255,149,0,0.1)" stroke="#ff9500" strokeWidth="2" />

                    <text x="400" y="280" textAnchor="middle" fill="white" fontSize="14">
                      West London Service Areas
                    </text>
                  </svg>
                </div>

                {/* Markers */}
                <div className="area-markers">
                  {areas.map((area, idx) => (
                    <div
                      key={idx}
                      className={`area-marker ${activeArea === idx ? "active" : ""} ${selectedArea === idx ? "selected" : ""}`}
                      style={area.position}
                      onMouseEnter={() => setActiveArea(idx)}
                      onMouseLeave={() => setActiveArea(null)}
                      onClick={() => setSelectedArea(selectedArea === idx ? null : idx)}
                    >
                      <div className="marker-dot">
                        <div className="pulse-ring"></div>
                      </div>

                      <div className="marker-tooltip">
                        <div className="tooltip-content">
                          <h4>{area.name}</h4>
                          <div className="postcodes">
                            {area.postcodes.map(pc => (
                              <span key={pc} className="postcode">{pc}</span>
                            ))}
                          </div>
                          <div className="service-indicator">
                            <span className="indicator-dot"></span>
                            Service Available
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* RIGHT SIDE INFO PANEL */}
            <div className="area-info-panel">
              <h3>West London Coverage</h3>

              {selectedArea !== null ? (
                <div className="selected-area-info">
                  <div className="area-header">
                    <h4>{areas[selectedArea].name}</h4>
                    <div className="postcode-badges">
                      {areas[selectedArea].postcodes.map(pc => (
                        <span key={pc} className="postcode-badge">{pc}</span>
                      ))}
                    </div>
                  </div>

                  <p className="area-description">
                    {areas[selectedArea].description}
                  </p>

                  <div className="service-features">
                    <div className="feature"><span className="icon">🚗</span> Free Pickup & Delivery</div>
                    <div className="feature"><span className="icon">⚡</span> Same-Day Service</div>
                    <div className="feature"><span className="icon">⭐</span> Premium Quality</div>
                  </div>

                  <button className="service-cta">
                    Schedule Pickup in {areas[selectedArea].name}
                  </button>
                </div>
              ) : (
                <div className="default-info">
                  <div className="welcome-message">
                    <h4>Welcome to Ironing Boy</h4>
                    <p>We provide premium laundry services across West London.</p>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">8</div>
                      <div className="stat-label">Areas Served</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">15+</div>
                      <div className="stat-label">Postcodes</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">24h</div>
                      <div className="stat-label">Delivery</div>
                    </div>
                  </div>

                  <div className="coverage-list">
                    <h5>All Service Areas:</h5>
                    <div className="areas-list">
                      {areas.map((area, index) => (
                        <div
                          key={index}
                          className="area-list-item"
                          onMouseEnter={() => setActiveArea(index)}
                          onMouseLeave={() => setActiveArea(null)}
                          onClick={() => setSelectedArea(index)}
                        >
                          <span className="area-name">{area.name}</span>
                          <span className="postcodes-small">{area.postcodes.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="coverage-footer">
          <div className="coverage-note">
            <p>📍 <strong>Full Coverage:</strong> All postcodes include free pickup & delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreas;
