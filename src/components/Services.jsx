// src/components/Services.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

// Local Images
import imageFullBody from "../images/shirtshang.webp";
import imageIronOnly from "../images/irononly.webp";
import imageDry from "../images/dryclean.webp";
import imageLeather from "../images/leather.webp";
import imageShoes from "../images/shoes.webp";
import imageBedding from "../images/bedding.webp";
import imageRepair from "../images/repair.webp";
import imageServiceWash from "../images/servicewash.webp";

// API
const API_BASE = "https://api.ironingboy.com";

// Map backend category names -> Local images
const categoryImages = {
  "Fullbody": imageFullBody,
  "IronOnly": imageIronOnly,
  "Dryclean": imageDry,
  "Leather": imageLeather,
  "Accessories": imageShoes,
  "Bedding": imageBedding,
  "Repair": imageRepair,
  "Servicewash": imageServiceWash
};

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categories`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const json = await res.json();
        setCategories(json.data || []);
        setError(null);
      } catch (e) {
        console.error("Category loading failed:", e);
        setError("Unable to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleBookNow = () => {
    navigate("/quick-booking");
  };

  const handleServiceClick = (id) => {
    navigate(`/services/${id}`);
  };

  return (
    <section className="services-section" id="services">
      <div className="container">
        {/* Header Section */}
        <div className="services-header">
          <div className="services-badge">
            <span>Our Expertise</span>
          </div>
          <h2 className="services-heading">Premium Laundry Services</h2>
          <p className="services-subheading">
            Professional care for your garments — from everyday essentials to delicate fabrics.
          </p>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="services-loading">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        )}

        {/* {error && (
          <div className="services-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )} */}

        {/* Services Grid */}
        {!loading && !error && categories.length > 0 && (
          <>
            <div className="services-grid">
              {categories.map((cat) => {
                const img = categoryImages[cat.name] || imageFullBody;
                return (
                  <div
                    key={cat.id}
                    className="service-card"
                    onClick={() => handleServiceClick(cat.id)}
                  >
                    <div className="service-image-wrapper">
                      <div
                        className="service-image"
                        style={{ backgroundImage: `url(${img})` }}
                      ></div>
                      <div className="service-overlay"></div>
                    </div>

                    <div className="service-content">
                      <div className="service-icon">
                        <i className="fas fa-spa"></i>
                      </div>
                      <h3>{cat.name}</h3>
                      <p>{cat.description || "Professional care for your items."}</p>

                      <button 
                        className="service-cta-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(cat.id);
                        }}
                      >
                        <i className="fas fa-arrow-right"></i> View Service
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            
          </>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="services-empty">
            <i className="fas fa-tshirt"></i>
            <h3>No Services Available</h3>
            <p>Check back soon for our service offerings.</p>
          </div>
        )}
        {/* Book Now Button Section */}
            <div className="book-now-section">
              <div className="book-now-card">
                <div className="book-now-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="book-now-content">
                  <h3>Ready for Fresh & Clean Clothes?</h3>
                  <p>Schedule a pickup in just 2 minutes. We handle everything from collection to delivery.</p>
                </div>
                <button 
                  className="book-now-btn"
                  onClick={handleBookNow}
                >
                  <i className="fas fa-calendar-check"></i> Book Now
                </button>
              </div>
            </div>
      </div>
    </section>
  );
};

export default Services;