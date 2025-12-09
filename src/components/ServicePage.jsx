// src/pages/ServicePage.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { SERVICES, AREAS } from "./areasAndServices";
import "./ServicePage.css";

export default function ServicePage() {
  const { serviceSlug } = useParams();
  const service = SERVICES.find(s => s.slug === serviceSlug);
  if (!service) return <div className="page-empty">Service not found</div>;

  return (
    <div className="service-page">
      <header className="service-hero" style={{ backgroundImage:`url(${service.image})` }}>
        <div className="overlay" />
        <div className="hero-inner">
          <div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/services">Services</Link> / <span>{service.title}</span></div>
          <h1>{service.title}</h1>
          <p className="lead">{service.description}</p>
        </div>
      </header>

      <main className="container">
        <section className="service-body">
          <h2>Why choose our {service.title}?</h2>
          <p className="muted">We combine expert care, fast collection and premium results.</p>

          <div className="service-features">
            <div className="feature">🚚 Free pickup & delivery</div>
            <div className="feature">⭐ Professional finishing</div>
            <div className="feature">⚡ Same-day options</div>
          </div>

          <h3>Available in these areas</h3>
          <div className="areas-list-inline">
            {AREAS.map(a => <Link key={a.slug} to={`/areas/${a.slug}/${service.slug}`} className="area-chip">{a.name}</Link>)}
          </div>

          <div className="faq">
            <h3>Frequently asked</h3>
            <details><summary>How long does it take?</summary><p>Typical turnaround 24-48 hrs.</p></details>
            <details><summary>Do you collect?</summary><p>Yes — we collect and deliver to your door.</p></details>
          </div>
        </section>
      </main>
    </div>
  );
}
