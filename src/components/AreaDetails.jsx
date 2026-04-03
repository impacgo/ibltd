// src/components/AreaDetails.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./AreaDetails.css";

// Import all local images for services
import accessoriesImg from "../images/accessories.webp";
import beddingImg from "../images/bedding.webp";
import fullBodyImg from "../images/shirtshang.webp";
import householdImg from "../images/household.webp";
import lowerImg from "../images/lower.webp";
import serviceWashImg from "../images/servicewash.webp";
import shirtsImg from "../images/shirtshang.webp";
import upperImg from "../images/upper.webp";
import shoesImg from "../images/shoes.webp";
import repairImg from "../images/repair.webp";

// Local AREAS data
const AREAS = [
  { name: "Ealing", slug: "ealing", postcodes: ["W5"] },
  { name: "West Ealing", slug: "west-ealing", postcodes: ["W13"] },
  { name: "Acton", slug: "acton", postcodes: ["W3"] },
  { name: "Hanwell", slug: "hanwell", postcodes: ["W7"] },
  { name: "Northolt / Greenford / Perivale", slug: "greenford", postcodes: ["UB5", "UB6"] },
  { name: "Chiswick High Road", slug: "chiswick-1", postcodes: ["W4 1"] },
  { name: "Bedford Park", slug: "chiswick-2", postcodes: ["W4 2"] },
  { name: "South Acton", slug: "chiswick-3", postcodes: ["W4 3"] },
  { name: "Gunnersbury / Chiswick Park", slug: "chiswick-4", postcodes: ["W4 4"] },
  { name: "Chiswick North West", slug: "chiswick-5", postcodes: ["W4 5"] },
];

const MAIN_SERVICES = [
  {
    id: 1,
    slug: "laundry",
    title: "Wash & Iron",
    icon: "fa-tshirt",
    description: "Professional washing, drying & folding service",
    features: ["Eco-friendly detergents", "Same-day service", "Free pickup"],
    category: "laundry",
    filterType: "Wash & Iron",
    searchTerms: ["Laundry", "Wash", "Cleaning"],
  },
  {
    id: 2,
    slug: "dry-cleaning",
    title: "Dry Cleaning",
    icon: "fa-snowflake",
    description: "Gentle care for delicate & special fabrics",
    features: ["Delicate fabrics", "Stain removal", "Premium care"],
    category: "dry_cleaning",
    filterType: "Dry Clean",
    searchTerms: ["Dry Clean", "Delicate"],
  },
  {
    id: 3,
    slug: "ironing-pressing",
    title: "Ironing / Pressing",
    icon: "fa-fire",
    description: "Crisp, wrinkle-free finish for all garments",
    features: ["Professional press", "Steam finishing"],
    category: "ironing",
    filterType: "Ironing",
    searchTerms: ["Ironing", "Pressing"],
  },
  {
    id: 4,
    slug: "service-wash",
    title: "Service Wash",
    icon: "fa-soap",
    description: "Complete laundry with premium detergents",
    features: ["Premium detergents", "Quality check"],
    category: "service_wash",
    filterType: "Service Wash",
    searchTerms: ["Service Wash"],
  },
  {
    id: 5,
    slug: "repair-alteration",
    title: "Repair & Alteration",
    icon: "fa-scissors",
    description: "Expert tailoring & perfect fit adjustments",
    features: ["Expert tailors", "Quick turnaround"],
    category: "repair",
    filterType: "Repair & Alteration",
    searchTerms: ["Repair", "Alteration"],
  },
  {
    id: 6,
    slug: "shoe-cleaning",
    title: "Shoe Cleaning",
    icon: "fa-shoe-prints",
    description: "Deep cleaning & conditioning for footwear",
    features: ["Deep clean", "Conditioning"],
    category: "shoe_cleaning",
    filterType: "Shoe Cleaning",
    searchTerms: ["Shoe", "Footwear"],
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

export default function AreaDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const area = AREAS.find((a) => a.slug === slug);
  if (!area) return <div className="page-empty">Area Not Found</div>;

  // Load services - SIMPLIFIED to always show all 6 services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        
        // Always use the 6 main services directly
        // This ensures all 6 services are always displayed
        setServices(MAIN_SERVICES);
        setError(null);
        
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Unable to load services. Please try again.");
        // Fallback to the 6 main services
        setServices(MAIN_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [slug]);

  const handleSchedulePickup = () => {
    navigate("/quick-booking");
  };

  // Navigate to QuickBooking with service preselected
const handleBookService = (service) => {
  navigate("/service-pricing", {
    state: {
      serviceCategory: service.category,
      serviceName: service.title,
      filterType: service.filterType,
      searchTerms: service.searchTerms,
      area: area.name,
    },
  });
};


  // Function to get image for service
  const getImageForService = (service) => {
    return serviceImages[service.slug] || serviceWashImg;
  };

  if (loading) {
    return (
      <div className="area-page">
        <header className="area-hero">
          <div className="area-hero-overlay"></div>
          <div className="area-hero-content container">
            <div className="area-breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/areas">Areas</Link> / {area.name}
            </div>
            <h1 className="area-title">{area.name} Laundry & Dry Cleaning</h1>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="area-page">
      {/* HERO SECTION */}
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
            <Link to="/areas" className="btn-secondary">
              View All Areas
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        <section className="area-main-section">
          {/* LEFT CONTENT */}
          <div className="area-left">
            <h2 className="section-heading">Services in {area.name}</h2>
            <p className="section-description">
              We offer complete garment-care solutions including ironing, dry cleaning, leather care,
              service wash and more.
            </p>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="service-cards-grid">
              {services.map((service) => {
                const serviceImage = getImageForService(service);
                
                return (
                  <div
  key={service.id}
  className="service-card icon-card"
  onClick={() => handleBookService(service)}
>
  <div className="service-icon-wrapper">
    <div className="service-icon">
      <i className={`fas ${service.icon}`}></i>
    </div>
  </div>

  <div className="service-card-info">
    <h3>{service.title}</h3>
    <p>{service.description}</p>

    <div className="service-features-list">
      {service.features.slice(0, 2).map((feature, idx) => (
        <span key={idx} className="service-feature">
          <i className="fas fa-check-circle"></i> {feature}
        </span>
      ))}
    </div>

    <button
      className="service-book-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleBookService(service);
      }}
    >
      <span>View Pricing</span>
      <i className="fas fa-arrow-right"></i>
    </button>
  </div>
</div>

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
                <li><strong>Services Available:</strong> {services.length}</li>
              </ul>

              <button
                className="btn-outline"
                onClick={handleSchedulePickup}
              >
                Book Service Now
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

        {/* CTA SECTION */}
        <section className="area-cta-section">
          <div className="cta-content">
            <h3>Need Help Choosing a Service?</h3>
            <p>Our team is here to help you select the right service for your garments.</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={handleSchedulePickup}>
                Schedule Free Pickup
              </button>
              <button className="btn-secondary" onClick={() => navigate("/faq")}>
                View FAQs
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}