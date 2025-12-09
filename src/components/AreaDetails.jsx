// src/pages/AreaDetails.jsx
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AREAS, SERVICES } from "./areasAndServices";
import "./AreaDetails.css";

// Import images
import imageFullBody from "../images/shirtshang.webp";
import imageIronOnly from "../images/irononly.webp";
import imageDry from "../images/dryclean.webp";
import imageLeather from "../images/leather.webp";
import imageShoes from "../images/shoes.webp";
import imageBedding from "../images/bedding.webp";
import imageRepair from "../images/repair.webp";
import imageServiceWash from "../images/servicewash.webp";

export default function AreaDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const area = AREAS.find((a) => a.slug === slug);
  if (!area) return <div className="page-empty">Area Not Found</div>;

  // Map service slugs to images
  const serviceImages = {
    "full-body": imageFullBody,
    "iron-only": imageIronOnly,
    "dry-cleaning": imageDry,
    "leather": imageLeather,
    "accessories": imageShoes,
    "bedding": imageBedding,
    "repair": imageRepair,
    "service-wash": imageServiceWash,
    // Add fallbacks for any missing mappings
    "fullbody": imageFullBody,
    "dryclean": imageDry,
  };

  const handleSchedulePickup = () => {
    navigate("/quick-booking");
  };

  const handleBookServiceWash = () => {
    navigate("/quick-booking");
  };

  return (
    <div className="area-page">

      {/* ---------------- HERO SECTION ---------------- */}
      <header className="area-hero">
        <div className="area-hero-overlay"></div>

        <div className="area-hero-content container">
          <div className="area-breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/areas">Areas</Link> / {area.name}
          </div>

          <h1 className="area-title">{area.name} Laundry & Dry Cleaning</h1>
          <p className="area-subtitle">
            Premium laundry, ironing, and dry-cleaning services across {area.postcodes.join(", ")}.
          </p>

          <div className="area-hero-buttons">
            <button onClick={handleSchedulePickup} className="btn-primary">
              Schedule Pickup
            </button>
            <Link to={`/areas/${slug}/all-services`} className="btn-secondary">
              View All Services
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="container">
        <section className="area-main-section">

          {/* LEFT CONTENT */}
          <div className="area-left">

            <h2 className="section-heading">Services in {area.name}</h2>
            <p className="section-description">
              We offer complete garment-care solutions including ironing, dry cleaning, leather care,
              service wash and more.
            </p>

            <div className="service-cards-grid">
              {SERVICES.map((service) => {
                // Get image for this service, fallback to first image if not found
                const serviceImage = serviceImages[service.slug] || 
                                    serviceImages[service.slug.toLowerCase()] || 
                                    imageFullBody;
                
                return (
                  <Link
                    key={service.slug}
                    to={`/areas/${slug}/${service.slug}`}
                    className="service-card"
                  >
                    <div
                      className="service-card-img"
                      style={{ backgroundImage: `url(${serviceImage})` }}
                    />
                    <div className="service-card-info">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="area-sidebar">
            <div className="sidebar-card">
              <h4>Area Information</h4>
              <ul>
                <li><strong>Postcodes:</strong> {area.postcodes.join(", ")}</li>
                <li><strong>Free Pickup:</strong> Yes</li>
                <li><strong>Delivery Time:</strong> 24–48 hrs</li>
              </ul>

              <button
                className="btn-outline"
                onClick={handleBookServiceWash}
              >
                Book Service Wash
              </button>
            </div>

            <div className="sidebar-card small">
              <h5>More Locations</h5>
              {AREAS.map((a) => (
                <Link
                  key={a.slug}
                  to={`/areas/${a.slug}`}
                  className={`location-link ${a.slug === slug ? "active" : ""}`}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </aside>

        </section>

        {/* ---------------- SEO SECTION ---------------- */}
        <section className="seo-section">
          <h3>Local Service Pages for {area.name}</h3>
          <p>Explore detailed service pages for {area.name}:</p>

          <ul className="seo-list">
            <li><Link to={`/areas/${slug}`}>/areas/{slug}</Link></li>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to={`/areas/${slug}/${s.slug}`}>/areas/{slug}/{s.slug}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}