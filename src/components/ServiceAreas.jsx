// src/components/ServiceAreas.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceAreas.css";

const AREAS = [
  { name: "Paddington", slug: "paddington", postcodes: ["W2"], position: { top: "42%", left: "48%" } },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"], position: { top: "45%", left: "44%" } },
  { name: "Kensington", slug: "kensington", postcodes: ["W8", "SW7"], position: { top: "48%", left: "47%" } },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"], position: { top: "52%", left: "47%" } },
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3", "SW10"], position: { top: "52%", left: "49%" } },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"], position: { top: "55%", left: "47%" } },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"], position: { top: "52%", left: "42%" } },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12", "W14"], position: { top: "48%", left: "40%" } },
];

export default function ServiceAreas() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const navigate = useNavigate();

  const openAreaPage = (slug) => {
    navigate(`/areas/${slug}`);
  };

  return (
    <div className="areas-page">
      {/* HERO SECTION */}
      <section className="areas-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>London Service Areas</h1>
          <p>Explore professional laundry & cleaning services in your neighbourhood</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="areas-content">
        {/* LEFT: MAP */}
        <div className="map-section">
          <div className="map-box">
            <img
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200"
              alt="London Map"
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
                <div className="marker-dot" />
                <span className="marker-label">{area.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AREA LIST */}
        <div className="area-list-box">
          <h2>All Service Areas</h2>

          <div className="area-list">
            {AREAS.map((a, i) => (
              <div
                key={a.slug}
                className="area-item"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => openAreaPage(a.slug)}
              >
                <div className="area-name">{a.name}</div>
                <div className="area-postcodes">{a.postcodes.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
