// src/pages/AreaDetails.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AREAS, SERVICES, fetchServicesFromBackend } from "./areasAndServices";
import "./AreaDetails.css";

// Import all local images for services
import accessoriesImg from "../images/accessories.webp"; //upadte
import beddingImg from "../images/bedding.webp";
import fullBodyImg from "../images/shirtshang.webp";
import householdImg from "../images/household.webp"; // update
import lowerImg from "../images/lower.webp";  //update
import serviceWashImg from "../images/servicewash.webp";
import shirtsImg from "../images/shirtshang.webp";  //update
import upperImg from "../images/upper.webp";
import shoesImg from "../images/shoes.webp";
import repairImg from "../images/repair.webp";

export default function AreaDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const area = AREAS.find((a) => a.slug === slug);
  if (!area) return <div className="page-empty">Area Not Found</div>;

  // Image mapping for services
  const serviceImages = {
    "accessories": accessoriesImg,
    "bedding": beddingImg,
    "fullbody": fullBodyImg,
    "household": householdImg,
    "lower": lowerImg,
    "servicewash": serviceWashImg,
    "shirts": shirtsImg,
    "upper": upperImg,
    "shoes": shoesImg,
    "repair-alteration": repairImg,
    "repair-altration": repairImg, // For backward compatibility with typo
  };

  // Fetch services from backend on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const backendServices = await fetchServicesFromBackend();
        
        if (backendServices && backendServices.length > 0) {
          // Use services from backend
          setServices(backendServices);
        } else {
          // Use local services if backend fails
          setServices(SERVICES);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Unable to load services. Please try again.");
        // Use local services on error
        setServices(SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleSchedulePickup = () => {
    navigate("/quick-booking");
  };

  const handleBookServiceWash = () => {
    navigate("/quick-booking");
  };

  // Function to get image for service
  const getImageForService = (service) => {
    // First try direct slug match
    if (serviceImages[service.slug]) {
      return serviceImages[service.slug];
    }
    
    // Try to find by partial slug match
    for (const [key, image] of Object.entries(serviceImages)) {
      if (service.slug.includes(key) || key.includes(service.slug)) {
        return image;
      }
    }
    
    // Default image
    return accessoriesImg;
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

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="service-cards-grid">
              {services.map((service) => {
                const serviceImage = getImageForService(service);
                
                return (
                  <Link
                    key={service.id}
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
                <li><strong>Services Available:</strong> {services.length}</li>
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
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/areas/${slug}/${service.slug}`}>/areas/{slug}/{service.slug}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}