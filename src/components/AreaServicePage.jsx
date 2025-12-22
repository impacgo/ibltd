// src/components/AreaServicePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./AreaServicePage.css";

// Local AREAS data
const AREAS = [
  { name: "Paddington", slug: "paddington", postcodes: ["W2"] },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"] },
  { name: "Kensington", slug: "kensington", postcodes: ["W8", "SW7"] },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"] },
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3", "SW10"] },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"] },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"] },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12", "W14"] },
  { name: "Oxford", slug: "oxford", postcodes: ["OX1", "OX2"] },
];

// Define the 10 specific services
const SPECIFIC_SERVICES = [
  { 
    slug: "accessories", 
    title: "Accessories Cleaning", 
    description: "Professional cleaning for scarves, ties, gloves, and other accessories",
    details: "We use specialized cleaning methods to ensure your accessories are cleaned safely and effectively."
  },
  { 
    slug: "bedding", 
    title: "Bedding Cleaning", 
    description: "Deep cleaning for duvets, pillows, sheets, and mattress covers",
    details: "Our bedding cleaning service uses hypoallergenic detergents and high-temperature washing for hygiene."
  },
  { 
    slug: "fullbody", 
    title: "Full Body Garments", 
    description: "Complete cleaning for dresses, gowns, and full-length garments",
    details: "Special care for delicate fabrics and intricate designs on full-length garments."
  },
  { 
    slug: "household", 
    title: "Household Items", 
    description: "Cleaning for curtains, cushion covers, tablecloths, and other household items",
    details: "We handle large household items with care and precision."
  },
  { 
    slug: "lower", 
    title: "Lower Garments", 
    description: "Professional cleaning for trousers, skirts, shorts, and other lower garments",
    details: "Expert cleaning and pressing for all types of lower garments."
  },
  { 
    slug: "servicewash", 
    title: "Service Wash", 
    description: "Complete laundry service including washing, drying, and folding",
    details: "Our most popular service - we handle everything from start to finish."
  },
  { 
    slug: "shirts", 
    title: "Shirts & Tops", 
    description: "Expert cleaning and ironing for shirts, blouses, and tops",
    details: "Professional ironing with crisp finishes for all types of shirts and tops."
  },
  { 
    slug: "upper", 
    title: "Upper Garments", 
    description: "Cleaning for jackets, jumpers, sweaters, and upper body garments",
    details: "Specialized cleaning for knitwear and outer garments."
  },
  { 
    slug: "shoes", 
    title: "Shoes Cleaning", 
    description: "Professional cleaning and conditioning for all types of shoes",
    details: "We clean and condition leather, suede, fabric, and synthetic shoes."
  },
  { 
    slug: "repair-alt", 
    title: "Repair & Alteration", 
    description: "Professional clothing repair, alterations, and tailoring services",
    details: "Expert tailoring for repairs, hemming, taking in/out, and other alterations."
  },
];

export default function AreaServicePage() {
  const { slug, serviceSlug } = useParams();
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState(null);

  const area = AREAS.find(a => a.slug === slug);
  const service = SPECIFIC_SERVICES.find(s => s.slug === serviceSlug);

  useEffect(() => {
    // Try to fetch additional details from backend if needed
    const fetchServiceDetails = async () => {
      try {
        const API_BASE = "https://api.ironingboy.com";
        const response = await fetch(`${API_BASE}/services/${serviceSlug}`);
        if (response.ok) {
          const data = await response.json();
          setServiceDetails(data);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      }
    };

    if (serviceSlug) {
      fetchServiceDetails();
    }
  }, [serviceSlug]);

  if (!area || !service) 
    return (
      <div className="page-empty">
        <h2>Page not found</h2>
        <p>The requested service or area could not be found.</p>
        <Link to="/areas" className="btn-primary">Browse All Areas</Link>
      </div>
    );

  const handleBookService = () => {
    navigate("/quick-booking");
  };

  const handleCheckPricing = () => {
    navigate("/pricing");
  };

  // Use backend details if available, otherwise use local
  const serviceTitle = serviceDetails?.name || service.title;
  const serviceDescription = serviceDetails?.description || service.description;
  const serviceFullDetails = serviceDetails?.details || service.details || service.description;

  return (
    <div className="area-service-page">
      {/* HERO */}
      <header className="as-hero">
        <div className="as-overlay" />
        <div className="as-hero-content">
          <div className="as-breadcrumbs">
            <Link to="/">Home</Link> / 
            <Link to="/areas"> Areas</Link> / 
            <Link to={`/areas/${slug}`}> {area.name}</Link> / 
            <span> {serviceTitle}</span>
          </div>

          <h1 className="as-title">{serviceTitle} in {area.name}</h1>
          <p className="as-subtitle">{serviceDescription}</p>

          <div className="as-buttons">
            <button className="btn-primary" onClick={handleBookService}>
              Book {serviceTitle}
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
            <h2 className="as-section-heading">About {serviceTitle}</h2>
            <p className="as-section-desc">
              {serviceFullDetails} — We service <strong>{area.name}</strong> 
              across {area.postcodes.join(", ")} with premium care.
            </p>

            <div className="as-steps">
              <div className="as-step">
                <h4>1. Book Pickup</h4>
                <p>Schedule a convenient pickup time online or by phone</p>
              </div>
              <div className="as-step">
                <h4>2. We Collect & Process</h4>
                <p>Our team collects your items and processes them professionally</p>
              </div>
              <div className="as-step">
                <h4>3. Deliver Fresh</h4>
                <p>Your cleaned items are delivered back to you fresh and ready to wear</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="as-sidebar">
            <div className="as-card">
              <h4>Service Quick Info</h4>
              <p><strong>Area:</strong> {area.name}</p>
              <p><strong>Postcodes:</strong> {area.postcodes.join(", ")}</p>
              <p><strong>Turnaround:</strong> 24–48 hrs</p>
              <p><strong>Free Pickup:</strong> Yes</p>
              <p><strong>Free Delivery:</strong> Yes</p>
            </div>

            <div className="as-card">
              <h5>Related Pages</h5>
              <Link to={`/areas/${slug}`}>All {area.name} Services</Link>
              <Link to="/services">All Services</Link>
              <Link to="/areas">All Areas</Link>
            </div>
          </aside>
        </section>

        {/* OTHER SERVICES IN AREA */}
        <section className="as-other-services">
          <h3>Other Services in {area.name}</h3>
          <div className="as-service-links">
            {SPECIFIC_SERVICES
              .filter(s => s.slug !== serviceSlug)
              .slice(0, 6)
              .map(otherService => (
                <Link 
                  key={otherService.slug}
                  to={`/areas/${slug}/${otherService.slug}`}
                  className="as-service-link"
                >
                  {otherService.title}
                </Link>
              ))
            }
          </div>
        </section>

        {/* SEO BLOCK */}
        <section className="as-seo-section">
          <h3>{serviceTitle} near {area.name}</h3>
          <p>
            This page is optimized for local visibility — discover premium {serviceTitle} 
            in {area.name} with fast delivery, professional care and exceptional quality.
            We serve all postcodes in {area.name} including {area.postcodes.join(", ")} 
            with our professional {serviceTitle.toLowerCase()} service.
          </p>
        </section>
      </main>
    </div>
  );
}
