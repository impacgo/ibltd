// src/components/AreaServicePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./AreaServicePage.css";

// Import images
import serviceWashImg from "../images/servicewash.webp";
import fullBodyImg from "../images/shirtshang.webp";
import shirtsImg from "../images/shirtshang.webp";
import repairImg from "../images/repair.webp";
import shoesImg from "../images/shoes.webp";

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
  { name: "Oxford", slug: "oxford", postcodes: ["OX1", "OX2","OX3","OX4"] },
];

// Define the 6 main services matching AreaDetails
const MAIN_SERVICES = [
  { 
    id: 1,
    slug: "laundry",
    title: "Laundry", 
    icon: "fa-tshirt",
    description: "Professional washing, drying & folding service",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    features: ["Eco-friendly detergents", "Same-day service", "Free pickup"],
    fullDescription: "Complete laundry service including washing, drying, and professional folding with eco-friendly detergents."
  },
  { 
    id: 2,
    slug: "dry-cleaning", 
    title: "Dry Cleaning", 
    icon: "fa-snowflake",
    description: "Gentle care for delicate & special fabrics",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    features: ["Delicate fabrics", "Stain removal", "Premium care"],
    fullDescription: "Expert dry cleaning for delicate fabrics, suits, dresses, and special occasion wear."
  },
  { 
    id: 3,
    slug: "ironing-pressing", 
    title: "Ironing/Pressing", 
    icon: "fa-fire",
    description: "Crisp, wrinkle-free finish for all garments",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
    features: ["Professional press", "Steam finishing", "Fold or hang"],
    fullDescription: "Professional ironing and pressing service for crisp, wrinkle-free results."
  },
  { 
    id: 4,
    slug: "service-wash", 
    title: "Service Wash", 
    icon: "fa-soap",
    description: "Complete laundry with premium detergents",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    features: ["Premium detergents", "Full service", "Quality check"],
    fullDescription: "Full-service laundry including pickup, washing, drying, folding, and delivery."
  },
  { 
    id: 5,
    slug: "repair-alteration", 
    title: "Repair & Alteration", 
    icon: "fa-scissors",
    description: "Expert tailoring & perfect fit adjustments",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    features: ["Expert tailors", "Quick turnaround", "Perfect fit"],
    fullDescription: "Professional clothing repair, alterations, and tailoring services."
  },
  { 
    id: 6,
    slug: "shoe-cleaning", 
    title: "Shoe Cleaning", 
    icon: "fa-shoe-prints",
    description: "Deep cleaning & conditioning for footwear",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
    features: ["Deep clean", "Conditioning", "Waterproofing"],
    fullDescription: "Professional cleaning, conditioning, and waterproofing for all types of shoes."
  },
];

// Image mapping for services
const serviceImages = {
  "laundry": serviceWashImg,
  "dry-cleaning": fullBodyImg,
  "ironing-pressing": shirtsImg,
  "service-wash": serviceWashImg,
  "repair-alteration": repairImg,
  "shoe-cleaning": shoesImg,
};

export default function AreaServicePage() {
  const { slug, serviceSlug } = useParams();
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const area = AREAS.find(a => a.slug === slug);
  const service = MAIN_SERVICES.find(s => s.slug === serviceSlug);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const API_BASE = "https://api.ironingboy.com";
        const response = await fetch(`${API_BASE}/services/${serviceSlug}`);
        if (response.ok) {
          const data = await response.json();
          setServiceDetails(data);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
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
    navigate("/quick-booking", { 
      state: { 
        service: service.title,
        area: area.name
      } 
    });
  };

  const handleCheckPricing = () => {
    navigate("/pricing");
  };

  const serviceImage = serviceImages[service.slug] || serviceWashImg;
  const serviceTitle = serviceDetails?.name || service.title;
  const serviceDescription = serviceDetails?.description || service.description;
  const serviceFullDetails = serviceDetails?.details || service.fullDescription || service.description;

  if (loading) {
    return (
      <div className="area-service-page">
        <header className="as-hero">
          <div className="as-overlay"></div>
          <div className="as-hero-content container">
            <div className="as-breadcrumbs">
              <Link to="/">Home</Link> / 
              <Link to="/areas"> Areas</Link> / 
              <Link to={`/areas/${slug}`}> {area.name}</Link> / 
              <span> {service.title}</span>
            </div>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading service details...</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="area-service-page">
      {/* HERO */}
      <header className="as-hero">
        <div className="as-overlay"></div>
        <div className="as-hero-content container">
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
            <div className="as-service-image">
              <img src={serviceImage} alt={serviceTitle} />
              <div className="as-service-icon" style={{ background: service.gradient }}>
                <i className={`fas ${service.icon}`}></i>
              </div>
            </div>

            <h2 className="as-section-heading">About {serviceTitle}</h2>
            <p className="as-section-desc">
              {serviceFullDescription}
            </p>

            <div className="as-service-features">
              <h3>Service Features</h3>
              <div className="as-features-grid">
                {service.features.map((feature, index) => (
                  <div key={index} className="as-feature-item">
                    <div className="as-feature-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="as-feature-text">
                      <h4>{feature}</h4>
                      <p>Premium quality guarantee</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="as-process-steps">
              <h3>How It Works in {area.name}</h3>
              <div className="as-steps-grid">
                <div className="as-step">
                  <div className="as-step-number">1</div>
                  <div className="as-step-content">
                    <h4>Schedule Pickup</h4>
                    <p>Book online or call us for free pickup</p>
                  </div>
                </div>
                <div className="as-step">
                  <div className="as-step-number">2</div>
                  <div className="as-step-content">
                    <h4>Professional Service</h4>
                    <p>We handle everything with care</p>
                  </div>
                </div>
                <div className="as-step">
                  <div className="as-step-number">3</div>
                  <div className="as-step-content">
                    <h4>Fast Delivery</h4>
                    <p>Receive within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="as-sidebar">
            <div className="as-card">
              <h4>Service Quick Info</h4>
              <div className="as-info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Area:</strong> {area.name}
                </div>
              </div>
              <div className="as-info-item">
                <i className="fas fa-mail-bulk"></i>
                <div>
                  <strong>Postcodes:</strong> {area.postcodes.join(", ")}
                </div>
              </div>
              <div className="as-info-item">
                <i className="fas fa-clock"></i>
                <div>
                  <strong>Turnaround:</strong> 24–48 hrs
                </div>
              </div>
              <div className="as-info-item">
                <i className="fas fa-truck"></i>
                <div>
                  <strong>Free Pickup:</strong> Yes
                </div>
              </div>
              <div className="as-info-item">
                <i className="fas fa-box"></i>
                <div>
                  <strong>Free Delivery:</strong> Yes
                </div>
              </div>
            </div>

            <div className="as-card">
              <h4>Related Pages</h4>
              <Link to={`/areas/${slug}`} className="as-related-link">
                <i className="fas fa-list"></i>
                All {area.name} Services
              </Link>
              <Link to="/services" className="as-related-link">
                <i className="fas fa-star"></i>
                All Services
              </Link>
              <Link to="/areas" className="as-related-link">
                <i className="fas fa-map"></i>
                All Areas
              </Link>
              <Link to="/pricing" className="as-related-link">
                <i className="fas fa-tag"></i>
                View Pricing
              </Link>
            </div>
          </aside>
        </section>

        {/* OTHER SERVICES IN AREA */}
        <section className="as-other-services">
          <div className="as-other-header">
            <h3>Other Services in {area.name}</h3>
            <Link to={`/areas/${slug}`} className="as-view-all">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="as-service-links-grid">
            {MAIN_SERVICES
              .filter(s => s.slug !== serviceSlug)
              .slice(0, 4)
              .map(otherService => (
                <Link 
                  key={otherService.slug}
                  to={`/areas/${slug}/${otherService.slug}`}
                  className="as-service-card"
                >
                  <div 
                    className="as-service-card-icon" 
                    style={{ background: otherService.gradient }}
                  >
                    <i className={`fas ${otherService.icon}`}></i>
                  </div>
                  <div className="as-service-card-content">
                    <h4>{otherService.title}</h4>
                    <p>{otherService.description}</p>
                  </div>
                </Link>
              ))
            }
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="as-cta-section">
          <div className="as-cta-content">
            <h3>Ready to Book {serviceTitle} in {area.name}?</h3>
            <p>Get professional {serviceTitle.toLowerCase()} with free pickup and delivery.</p>
            <div className="as-cta-buttons">
              <button className="as-cta-primary" onClick={handleBookService}>
                <i className="fas fa-calendar-check"></i>
                Book Now
              </button>
              <button className="as-cta-secondary" onClick={() => navigate("/contact")}>
                <i className="fas fa-phone"></i>
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}