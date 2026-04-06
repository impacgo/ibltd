// src/components/ServiceAreas.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceAreas.css";



const AREAS = [
  // ✅ OLD AREAS (UNCHANGED)
  { name: "Paddington", slug: "paddington", postcodes: ["W2"], position: { top: "42%", left: "48%" }, icon: "fas fa-train" },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"], position: { top: "45%", left: "44%" }, icon: "fas fa-home" },
  { name: "Kensington", slug: "kensington", postcodes: ["W8", "SW7"], position: { top: "48%", left: "47%" }, icon: "fas fa-landmark" },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"], position: { top: "52%", left: "47%" }, icon: "fas fa-theater-masks" },
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3", "SW10"], position: { top: "52%", left: "49%" }, icon: "fas fa-university" },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"], position: { top: "55%", left: "47%" }, icon: "fas fa-futbol" },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"], position: { top: "52%", left: "42%" }, icon: "fas fa-hammer" },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12", "W14"], position: { top: "48%", left: "40%" }, icon: "fas fa-tree" },

  // ✅ NEW AREAS (ADDED)
  { name: "Ealing", slug: "ealing", postcodes: ["W5"], position: { top: "45%", left: "38%" }, icon: "fas fa-map-marker-alt" },
  { name: "West Ealing", slug: "west-ealing", postcodes: ["W13"], position: { top: "46%", left: "36%" }, icon: "fas fa-map-marker-alt" },
  { name: "Acton", slug: "acton", postcodes: ["W3"], position: { top: "48%", left: "39%" }, icon: "fas fa-map-marker-alt" },
  { name: "Hanwell", slug: "hanwell", postcodes: ["W7"], position: { top: "47%", left: "34%" }, icon: "fas fa-map-marker-alt" },
  { name: "Northolt / Greenford / Perivale", slug: "greenford", postcodes: ["UB5", "UB6"], position: { top: "42%", left: "33%" }, icon: "fas fa-map-marker-alt" },
  { name: "Chiswick High Road", slug: "chiswick-1", postcodes: ["W4 1"], position: { top: "50%", left: "41%" }, icon: "fas fa-map-marker-alt" },
  { name: "Bedford Park", slug: "chiswick-2", postcodes: ["W4 2"], position: { top: "51%", left: "40%" }, icon: "fas fa-map-marker-alt" },
  { name: "South Acton", slug: "chiswick-3", postcodes: ["W4 3"], position: { top: "52%", left: "39%" }, icon: "fas fa-map-marker-alt" },
  { name: "Gunnersbury / Chiswick Park", slug: "chiswick-4", postcodes: ["W4 4"], position: { top: "52%", left: "42%" }, icon: "fas fa-map-marker-alt" },
  { name: "Chiswick North West", slug: "chiswick-5", postcodes: ["W4 5"], position: { top: "49%", left: "42%" }, icon: "fas fa-map-marker-alt" },
];

export default function ServiceAreas() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const openAreaPage = (slug) => {
    navigate(`/areas/${slug}`);
  };

  const handleBookCollection = () => {
    navigate("/quick-booking");
  };

  const handleContactSupport = () => {
    navigate("/contact");
  };

  const handleCheckAvailability = () => {
    // Navigate to home page and pass state to trigger service availability check
    navigate("/", { state: { openServiceCheck: true } });
  };

const filteredAreas = AREAS.filter(area => {
  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();

    const matchesName = area.name.toLowerCase().includes(query);
    const matchesPostcode = area.postcodes.some(pc =>
      pc.toLowerCase().includes(query)
    );

    return matchesName || matchesPostcode;
  }

  return true;
});


  return (
    <div className="areas-page">
      {/* HERO SECTION */}
      <section className="areas-hero">
        <div className="hero-overlay" />
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-map-marker-alt"></i>
              <span>Service Coverage</span>
            </div>
            
            <h1 className="hero-title">
              {/* We Serve 
              <span className="hero-highlight"> London & Oxford</span> Areas */}
              Professional Ironing & Laundry Service in
<span className="hero-highlight"> West London</span>
            </h1>
            
            <p className="hero-subtitle">
              West London's trusted ironing & laundry service. We offer shirt ironing, 
bedding ironing, wash & fold, and free collection & delivery across 
Ealing, Acton, Hanwell, Greenford, Chiswick and surrounding areas.
            </p>

            {/* Stats */}
            {/* <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-location-dot"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{AREAS.length}</div>
                  <div className="stat-label">Areas Covered</div>
                </div>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-mail-bulk"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {AREAS.reduce((total, area) => total + area.postcodes.length, 0)}
                  </div>
                  <div className="stat-label">Postcode Zones</div>
                </div>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-truck-fast"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Free Collection</div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="areas-content">
        <div className="content-container">
          {/* Page Header */}
          <div className="content-header">
            <h2 className="section-title">Explore Our Service Areas</h2>
            <p className="section-subtitle">
              Click any area on the map or in the list below to view service details, pricing, and delivery options
            </p>
            
            {/* Filter Buttons */}
            <div className="area-filters">
              <button 
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                <i className="fas fa-globe"></i>
                All Areas
              </button>
              <button 
                className={`filter-btn ${activeFilter === "london" ? "active" : ""}`}
                onClick={() => setActiveFilter("london")}
              >
                <i className="fas fa-landmark"></i>
                Service Areas
              </button>
              
            </div>
          </div>

          {/* Main Grid */}
          <div className="areas-grid">
            {/* MAP SECTION */}
            <div className="map-section">
              <div className="map-card">
                <div className="map-header">
                  <h3 className="map-title">
                    <i className="fas fa-map"></i>
                    Interactive Service Map
                  </h3>
                  <div className="map-legend">
                    <div className="legend-item">
                      <span className="legend-dot active"></span>
                      <span>Current Selection</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot"></span>
                      <span>Service Area</span>
                    </div>
                  </div>
                </div>
                
                <div className="map-box">
                  <img
                    src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200"
                    alt="London and Oxford Map"
                    className="map-image"
                  />

                  {AREAS.map((area, i) => (
                    <div
                      key={i}
                      className={`map-marker ${hoverIndex === i ? "active" : ""}`}
                      style={area.position}
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => openAreaPage(area.slug)}
                    >
                      <div className="marker-pulse"></div>
                      <div className="marker-dot">
                        <i className={area.icon}></i>
                      </div>
                      <div className="marker-label">
                        <span className="marker-name">{area.name}</span>
                        <span className="marker-postcodes">{area.postcodes.join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="map-footer">
                  <div className="map-note">
                    <i className="fas fa-info-circle"></i>
                    <span>Click any marker to view area details and service information</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AREA LIST SECTION */}
            <div className="list-section">
              <div className="list-card">
                <div className="list-header">
                  <h3 className="list-title">
                    <i className="fas fa-list-check"></i>
                    All Service Areas
                    <span className="list-count">{filteredAreas.length}</span>
                  </h3>
                  <div className="list-controls">
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
  type="text"
  placeholder="Search areas or postcodes (e.g. Fulham, SW6)"
  className="search-input"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

                    </div>
                  </div>
                </div>
                
                <div className="area-list">
                  {filteredAreas.map((area, i) => (
                    <div
                      key={area.slug}
                      className={`area-item ${hoverIndex === i ? "active" : ""}`}
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => openAreaPage(area.slug)}
                    >
                      <div className="area-icon">
                        <i className={area.icon}></i>
                      </div>
                      <div className="area-content">
                        <div className="area-header">
                          <h4 className="area-name">{area.name}</h4>
                          <div className="area-status">
                            <span className="status-badge">
                              <i className="fas fa-check-circle"></i>
                              Service Available
                            </span>
                          </div>
                        </div>
                        <div className="area-details">
                          <div className="area-postcodes">
                            <i className="fas fa-mail-bulk"></i>
                            <span>Postcodes: {area.postcodes.join(", ")}</span>
                          </div>
                          <div className="area-delivery">
                            <i className="fas fa-truck"></i>
                            <span>Free Pickup & Delivery</span>
                          </div>
                        </div>
                      </div>
                      <div className="area-action">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="list-footer">
                 <div className="footer-note">
  <i className="fas fa-clock"></i>
 <span>Same-day collection available in all West London areas including Ealing, Acton, Chiswick & more</span>
</div>
                  <button 
                    className="book-all-btn"
                    onClick={handleBookCollection}
                  >
                    <i className="fas fa-calendar-check"></i>
                    Book Collection Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="areas-cta">
            <div className="cta-content">
              <h3>Not in Our Service Area Yet?</h3>
              <p>We're expanding rapidly! Contact us to request service in your area.</p>
              <div className="cta-actions">
                <button 
                  className="cta-primary"
                  onClick={handleContactSupport}
                >
                  <i className="fas fa-phone-alt"></i>
                  Request Service Expansion
                </button>
                <button 
                  className="cta-secondary"
                  onClick={handleCheckAvailability}
                >
                  <i className="fas fa-question-circle"></i>
                  Check Service Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
