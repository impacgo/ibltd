import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star, Truck, Shield, Users } from "lucide-react";
import "./ServiceDetail.css";

const API_BASE = "https://api.ironingboy.com";

const ServiceDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Clean, professional Unsplash images
  const serviceImages = {
    1: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    2: "https://images.unsplash.com/photo-1558769132-cb1f3c706b83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    3: "https://images.unsplash.com/photo-1600585154340-8734d4adab31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    4: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    5: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    6: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    7: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    8: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    9: "https://images.unsplash.com/photo-1602052577122-f73b9710adba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  };

  const defaultImage = "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/categories/${categoryId}`);
        
        if (response.ok) {
          const data = await response.json();
          setCategory(data.data || data);
        } else {
          setError("Service not found");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleBookNow = () => {
    navigate("/quick-booking");
  };

  const handleGetPrices = () => {
    navigate("/pricing");
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="service-loading">
        <div className="spinner"></div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="service-error">
        <div className="error-content">
          <div className="error-icon">!</div>
          <h2>Service Not Found</h2>
          <p>The service you're looking for doesn't exist or is temporarily unavailable.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const serviceImage = serviceImages[categoryId] || defaultImage;
  const serviceTitle = category.name.toUpperCase();

  return (
    <div className="service-detail-container">
      {/* Header */}
      <header className="service-header">
        <div className="container">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="logo">IRONING BOY</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="service-hero" style={{ backgroundImage: `url(${serviceImage})` }}>
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">{serviceTitle}</h1>
              <p className="hero-subtitle">
                Professional cleaning service with premium treatment and care
              </p>
              <div className="hero-badge">
                <Truck size={20} />
                <span>Free Pickup & Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="service-main">
        <div className="container">
          {/* Service Features */}
          <div className="service-features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Check size={24} />
              </div>
              <h3>Premium Stain Treatment</h3>
              <p>Advanced cleaning solutions for toughest stains</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3>Quality Guaranteed</h3>
              <p>100% satisfaction or your money back</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Star size={24} />
              </div>
              <h3>Eco-Friendly</h3>
              <p>Environmentally safe cleaning products</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={24} />
              </div>
              <h3>10,000+ Happy Customers</h3>
              <p>Trusted by families and businesses</p>
            </div>
          </div>

          {/* Service Description */}
          <div className="service-description">
            <h2>About This Service</h2>
            <p>
              Our {category.name.toLowerCase()} service provides professional cleaning with the highest 
              standards of care. Using premium equipment and eco-friendly detergents, 
              we ensure your items receive the best treatment possible.
            </p>
            <ul className="service-benefits">
              <li><Check size={16} /> Professional grade equipment</li>
              <li><Check size={16} /> Eco-friendly detergents</li>
              <li><Check size={16} /> Same-day service available</li>
              <li><Check size={16} /> Quality inspection guarantee</li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="service-cta">
            <div className="cta-card">
              <h2>Ready to Get Started?</h2>
              <p>Book now and experience premium cleaning service</p>
              <div className="cta-buttons">
                <button 
                  className="btn-primary btn-large"
                  onClick={handleBookNow}
                >
                  BOOK NOW
                </button>
                <button 
                  className="btn-secondary btn-large"
                  onClick={handleGetPrices}
                >
                  VIEW PRICING
                </button>
              </div>
              <div className="cta-note">
                <Check size={16} />
                <span>Free pickup & delivery included in all orders</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="service-footer">
        <div className="container">
          <p>© 2024 IRONING BOY Professional Laundry Services. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceDetail;