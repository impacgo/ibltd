// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from "../images/logo1.svg";

const API_BASE = "https://api.ironingboy.com";

const serviceData = [
  { id: 1, name: "Laundry" },
  { id: 2, name: "Dry Cleaning" },
  { id: 3, name: "Ironing/Pressing" },
  { id: 4, name: "Service Wash" },
  { id: 5, name: "Repair & Alteration" },
  { id: 6, name: "Shoe Cleaning" }
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const navigate = useNavigate();

  // Handle navigation for services
  const handleServiceClick = (serviceName) => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    
    // Navigate to services page
    navigate('/services', {
      state: { 
        scrollToService: serviceName,
        fromFooter: true 
      }
    });
  };

  // Handle navigation for other links
  const handleNavigation = (path) => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    navigate(path);
  };

  // Handle subscribe form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail('');
    }
  };

  // Handle app download buttons
  // Handle Android App download (LIVE)
const handleAndroidApp = () => {
  window.open(
    "https://play.google.com/store/apps/details?id=com.impacgo.ironingboy",
    "_blank",
    "noopener,noreferrer"
  );
};

// Handle Apple App (Coming Soon)
const handleAppleApp = () => {
  window.open(
    "https://apps.apple.com/app/ironingboy/id6755144154",
    "_blank",
    "noopener,noreferrer"
  );
};


  // Toggle mobile accordion
  const toggleAccordion = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Open Terms & Conditions
  const handleTermsClick = () => {
    window.open('/TermsPage.html', '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  // Open Privacy Policy
  const handlePrivacyClick = () => {
    window.open('/PrivacyPolicy.html', '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* App Download Section - Show on all devices */}
        <div className="app-download-section">
          <div className="app-content">
            <div className="app-text">
              <h3>Get the Ironing Boy App</h3>
              <p>Download our app for faster booking, order tracking, and exclusive offers</p>
              <div className="app-buttons">
                <button className="app-btn android-btn" onClick={handleAndroidApp}>
                  <i className="fab fa-google-play"></i>
                  <div className="btn-text">
                    <span className="get-on">GET IT ON</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
                <button className="app-btn apple-btn" onClick={handleAppleApp}>
                  <i className="fab fa-apple"></i>
                  <div className="btn-text">
                    <span className="download-on">Download on the</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="app-illustration desktop-only">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="app-icon">
                      <img 
                        src={logo} 
                        alt="Ironing Boy App" 
                        style={{height:"70px",width:"70px",borderRadius:"25%"}}
                      />
                    </div>
                    <span>Ironing Boy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="brand-title">Ironing Boy</h3>
            <p className="brand-tagline">We Wash. We Iron. We Care.</p>
            <p className="brand-description">
              Professional laundry services delivered to your doorstep. Experience the difference with Ironing Boy.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/ironingboyy/" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/ironingboy/" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://x.com/ironingboyltd?s=11" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/company/110988962/admin/page-posts/published/" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-links">
            {/* Services Column - FIXED: Now shows all 6 services properly on laptop */}
            <div className="footer-column services-column">
              <div className="footer-column-header" onClick={() => toggleAccordion('services')}>
                <h4>Our Services</h4>
                <span className="accordion-toggle">
                  <i className={`fas fa-chevron-${expandedSection === 'services' ? 'up' : 'down'}`}></i>
                </span>
              </div>
              <div className={`footer-column-content ${expandedSection === 'services' ? 'active' : ''}`}>
                <div className="services-grid">
                  <div className="services-column-left">
                    <ul className="services-list">
                      {serviceData.slice(0, 3).map((service) => (
                        <li key={service.id}>
                          <button 
                            className="category-link footer-nav-link"
                            onClick={() => handleServiceClick(service.name)}
                            aria-label={`View ${service.name} service`}
                          >
                            {service.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="services-column-right">
                    <ul className="services-list">
                      {serviceData.slice(3, 6).map((service) => (
                        <li key={service.id}>
                          <button 
                            className="category-link footer-nav-link"
                            onClick={() => handleServiceClick(service.name)}
                            aria-label={`View ${service.name} service`}
                          >
                            {service.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links - FIXED: Centered on mobile */}
            <div className="footer-column quick-links-column">
              <div className="footer-column-header" onClick={() => toggleAccordion('quick-links')}>
                <h4>Quick Links</h4>
                <span className="accordion-toggle">
                  <i className={`fas fa-chevron-${expandedSection === 'quick-links' ? 'up' : 'down'}`}></i>
                </span>
              </div>
              <div className={`footer-column-content ${expandedSection === 'quick-links' ? 'active' : ''}`}>
                <ul className="quick-links-list">
                  <li>
                    <button onClick={() => handleNavigation('/services')} className="footer-link footer-nav-link">
                      Services
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/areas')} className="footer-link footer-nav-link">
                      Areas
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/pricing')} className="footer-link footer-nav-link">
                      Pricing
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/how-it-works')} className="footer-link footer-nav-link">
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/faq')} className="footer-link footer-nav-link">
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="footer-column contact-column">
              <div className="footer-column-header" onClick={() => toggleAccordion('contact')}>
                <h4>Contact Info</h4>
                <span className="accordion-toggle">
                  <i className={`fas fa-chevron-${expandedSection === 'contact' ? 'up' : 'down'}`}></i>
                </span>
              </div>
              <div className={`footer-column-content ${expandedSection === 'contact' ? 'active' : ''}`}>
                <ul className="contact-info">
                  <li>
                    <i className="fas fa-phone"></i>
                    <span>+44 02031231010</span>
                  </li>
                  <li>
                    <i className="fas fa-envelope"></i>
                    <span>support@ironingboy.com</span>
                  </li>
                  {/* <li>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>2 Turnpike Lane, Uxbridge, Hillingdon, UB10 0AH, UK</span>
                  </li> */}
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="footer-column newsletter-column">
              <div className="footer-column-header" onClick={() => toggleAccordion('newsletter')}>
                <h4>Stay Updated</h4>
                <span className="accordion-toggle">
                  <i className={`fas fa-chevron-${expandedSection === 'newsletter' ? 'up' : 'down'}`}></i>
                </span>
              </div>
              <div className={`footer-column-content ${expandedSection === 'newsletter' ? 'active' : ''}`}>
                <p className="newsletter-text">Get the latest offers</p>
                <form className="newsletter-form" onSubmit={handleSubmit}>
                  <div className="newsletter-group">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-label="Email for newsletter subscription"
                    />
                    <button 
                      type="submit" 
                      className="send-button"
                      aria-label="Subscribe to newsletter"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="payment-section">
            <span className="payment-label">We Accept:</span>
            <div className="payment-methods">
              <i className="fab fa-cc-visa" title="Visa"></i>
              <i className="fab fa-cc-mastercard" title="Mastercard"></i>
              <i className="fab fa-cc-amex" title="American Express"></i>
              <i className="fab fa-cc-paypal" title="PayPal"></i>
            </div>
          </div>

          <div className="copyright">
            <p>&copy; 2025 Ironing Boy. All rights reserved.</p>
            <div className="legal-links">
              <button 
                onClick={handlePrivacyClick} 
                className="footer-link legal-link footer-nav-link"
                title="Opens Privacy Policy in new window"
              >
                Privacy Policy <i className="fas fa-external-link-alt external-icon"></i>
              </button>
              <button 
                onClick={handleTermsClick} 
                className="footer-link legal-link footer-nav-link"
                title="Opens Terms & Conditions in new window"
              >
                Terms & Conditions <i className="fas fa-external-link-alt external-icon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;