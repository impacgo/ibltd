// src/pages/AreaPage.jsx
import React from "react";
import "./AreaPage.css";
import { useParams } from "react-router-dom";

const AREA_DATA = {
  "paddington": {
    name: "Paddington",
    description: "Premium laundry & dry cleaning service across Paddington.",
    postcodes: ["W2"],
    heroImage: "https://source.unsplash.com/1500x800/?london,city",
  },
  "notting-hill": {
    name: "Notting Hill",
    description: "Luxury cleaning services near Portobello Road.",
    postcodes: ["W11"],
    heroImage: "https://source.unsplash.com/1500x800/?notting-hill",
  },
};

const SERVICES = [
  { name: "Ironing Service", slug: "ironing-service", icon: "🧺" },
  { name: "Laundry Service", slug: "laundry-service", icon: "👕" },
  { name: "Dry Cleaning", slug: "dry-cleaning-service", icon: "🧼" },
  { name: "Leather Cleaning", slug: "leather-cleaning-service", icon: "🧥" },
  { name: "Shoes & Bags Care", slug: "shoes-bags-service", icon: "👠" },
  { name: "Repair & Alteration", slug: "repair-alteration-service", icon: "✂️" },
];

export default function AreaPage() {
  const { areaSlug } = useParams();
  const area = AREA_DATA[areaSlug];

  if (!area) return <h2>Area not found</h2>;

  return (
    <div className="area-page">

      <section className="area-hero" style={{ backgroundImage: `url(${area.heroImage})` }}>
        <div className="overlay"></div>
        <div className="hero-content">
          <p className="breadcrumbs">Home / Areas / {area.name}</p>
          <h1>{area.name} Laundry & Dry Cleaning</h1>
          <p>{area.description}</p>
          <div className="postcode-badge">Postcodes: {area.postcodes.join(", ")}</div>
        </div>
      </section>

      <section className="services-section">
        <h2>Services Available in {area.name}</h2>

        <div className="service-grid">
          {SERVICES.map((s) => (
            <a
              key={s.slug}
              href={`/areas/${areaSlug}/${s.slug}`}
              className="service-card"
            >
              <span className="service-icon">{s.icon}</span>
              <h3>{s.name}</h3>
            </a>
          ))}
        </div>
      </section>

      <section className="area-cta">
        <h2>Book Your Laundry Pickup</h2>
        <button className="cta-btn">Schedule Now</button>
      </section>

    </div>
  );
}
