// src/components/NotFound.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';
import logo from "../images/logo1.svg";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      {/* Background Animation */}
      <div className="error-bg-animation">
        <div className="error-bg-shape error-bg-shape-1"></div>
        <div className="error-bg-shape error-bg-shape-2"></div>
        <div className="error-bg-shape error-bg-shape-3"></div>
        <div className="error-bg-shape error-bg-shape-4"></div>
      </div>

      <div className="not-found-container">
        {/* Main Card */}
        <div className="not-found-card">
          {/* Header with Logo */}
          <div className="not-found-header">
            <div className="logo-container">
              <div className="app-logo">
                <img 
                  src={logo} 
                  alt="IroningBoy Logo" 
                  className="logo-img"
                />
              </div>
              <span className="app-name">IroningBoy</span>
            </div>
            <div className="error-badge">
              <span className="error-dot"></span>
              Error 404
            </div>
          </div>

          {/* Main Content */}
          <div className="not-found-content">
            {/* Animated Error Code */}
            <div className="error-code-container">
              <div className="error-code">
                <span className="error-digit error-4">4</span>
                <div className="error-zero">
                  <div className="zero-inner">0</div>
                </div>
                <span className="error-digit error-4">4</span>
              </div>
            </div>

            {/* Error Message */}
            <div className="error-message-section">
              <h1 className="error-title">
                Oops! Page Not Found
              </h1>
              
              <p className="error-description">
                The page you're looking for seems to have vanished like a sock in the laundry. 
                Don't worry - we'll help you find your way back to clean navigation!
              </p>

              <div className="error-details">
                <div className="error-detail-item">
                  <div className="error-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="error-detail-text">
                    <h4>What happened?</h4>
                    <p>The page may have been moved, deleted, or you might have typed the wrong URL.</p>
                  </div>
                </div>

                <div className="error-detail-item">
                  <div className="error-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="error-detail-text">
                    <h4>What can you do?</h4>
                    <p>Try going back or use the navigation below to find what you need.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button 
                onClick={() => navigate(-1)}
                className="error-action-btn secondary"
              >
                <i className="fas fa-arrow-left"></i>
                Go Back
              </button>

              <Link to="/" className="error-action-btn primary">
                <i className="fas fa-home"></i>
                Back to Home
              </Link>

              <Link to="/services" className="error-action-btn outline">
                <i className="fas fa-concierge-bell"></i>
                View Services
              </Link>
            </div>

            {/* Quick Links */}
            <div className="quick-links-section">
              <h3 className="quick-links-title">Popular Pages</h3>
              <div className="quick-links-grid">
                <Link to="/services" className="quick-link">
                  <i className="fas fa-shirt"></i>
                  <span>Services</span>
                </Link>
                <Link to="/pricing" className="quick-link">
                  <i className="fas fa-tags"></i>
                  <span>Pricing</span>
                </Link>
                <Link to="/how-it-works" className="quick-link">
                  <i className="fas fa-play-circle"></i>
                  <span>How it Works</span>
                </Link>
                <Link to="/contact" className="quick-link">
                  <i className="fas fa-phone-alt"></i>
                  <span>Contact Us</span>
                </Link>
                <Link to="/areas" className="quick-link">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Service Areas</span>
                </Link>
                <Link to="/quick-booking" className="quick-link">
                  <i className="fas fa-bolt"></i>
                  <span>Quick Booking</span>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="error-search-section">
              <h4>Can't find what you're looking for?</h4>
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search our website..." 
                  className="search-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${e.target.value}`);
                    }
                  }}
                />
                <button 
                  className="search-btn"
                  onClick={() => {
                    const input = document.querySelector('.search-input');
                    if (input.value) {
                      navigate(`/search?q=${input.value}`);
                    }
                  }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="not-found-footer">
              <p className="footer-text">
                Need immediate assistance? <a href="tel:+4402031231010">Call us: +44 02031231010</a>
              </p>
              <div className="footer-links">
                <Link to="/terms">Terms of Service</Link>
                <span className="divider">•</span>
                <Link to="/contact">Support</Link>
                <span className="divider">•</span>
                <a href="mailto:support@ironingboy.com">Email Us</a>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Animation Element */}
        <div className="fun-animation">
          <div className="floating-item floating-shirt">
            <i className="fas fa-shirt"></i>
          </div>
          <div className="floating-item floating-iron">
            <i className="fas fa-fire"></i>
          </div>
          <div className="floating-item floating-bubble">
            <i className="fas fa-water"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;