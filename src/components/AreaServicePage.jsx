// src/pages/AreaServicePage.jsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AREAS, SERVICES } from "./areasAndServices";
import "./AreaServicePage.css";

export default function AreaServicePage() {
  const { slug, serviceSlug } = useParams();
  const navigate = useNavigate();

  const area = AREAS.find(a => a.slug === slug);
  const service = SERVICES.find(s => s.slug === serviceSlug);

  if (!area || !service) 
    return <div className="page-empty">Page not found</div>;

  const handleBookService = () => {
    navigate("/quick-booking");
  };

  const handleCheckPricing = () => {
    navigate("/pricing");
  };

  return (
    <div className="area-service-page">
      {/* HERO */}
      <header className="as-hero" style={{ backgroundImage: `url("/hero-common.jpg")` }}>
        <div className="as-overlay" />

        <div className="as-hero-content">
          <div className="as-breadcrumbs">
            <Link to="/">Home</Link> / 
            <Link to="/areas"> Areas</Link> / 
            <Link to={`/areas/${slug}`}> {area.name}</Link> / 
            <span> {service.title}</span>
          </div>

          <h1 className="as-title">{service.title} in {area.name}</h1>
          <p className="as-subtitle">{service.description}</p>

          <div className="as-buttons">
            <button className="btn-primary" onClick={handleBookService}>
              Book {service.title}
            </button>
            <button className="btn-secondary" onClick={handleCheckPricing}>
              Check Pricing
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SECTION */}
      <main className="as-container">

        <section className="as-content">
          {/* LEFT SIDE */}
          <div className="as-left">
            <h2 className="as-section-heading">What We Do</h2>
            <p className="as-section-desc">
              {service.description} — We service <strong>{area.name}</strong> 
              across {area.postcodes.join(", ")} with premium care.
            </p>

            <div className="as-steps">
              <div className="as-step">1. Book Pickup</div>
              <div className="as-step">2. We Collect & Process</div>
              <div className="as-step">3. Deliver Fresh</div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="as-sidebar">
            <div className="as-card">
              <h4>Service Quick Info</h4>
              <p><strong>Area:</strong> {area.name}</p>
              <p><strong>Postcodes:</strong> {area.postcodes.join(", ")}</p>
              <p><strong>Turnaround:</strong> 24–48 hrs</p>
            </div>

            <div className="as-card">
              <h5>Related Pages</h5>
              <Link to={`/areas/${slug}`}>All {area.name} Services</Link>
              <Link to={`/services/${service.slug}`}>General {service.title} Service</Link>
            </div>
          </aside>
        </section>

        {/* SEO BLOCK */}
        <section className="as-seo-section">
          <h3>{service.title} near {area.name}</h3>
          <p>
            This page is optimized for local visibility — discover premium {service.title} 
            in {area.name} with fast delivery, professional care and exceptional quality.
          </p>
        </section>

      </main>
    </div>
  );
}