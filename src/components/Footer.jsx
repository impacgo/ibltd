// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from "../images/logo1.svg";

const API_BASE = "https://api.ironingboy.com";

// Add this function at the top of Footer.jsx, after the imports
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/categories`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        // Handle both possible response formats
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category click - navigate to service detail page with slug
  const handleCategoryClick = (category) => {
    const categorySlug = slugify(category.name);
    navigate(`/category/${categorySlug}`);
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
  const handleGetApp = () => {
    navigate('/coming-soon', {
      state: {
        title: "Mobile App Coming Soon",
        description: "Our mobile app is under development. Get ready for an amazing on-the-go laundry experience!",
        featureName: "Mobile Application",
        expectedTime: "Q2 2025"
      }
    });
  };

  // Open Terms & Conditions from public folder
  const handleTermsClick = () => {
    window.open('/TermsPage.html', '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  // Open Privacy Policy
  const handlePrivacyClick = () => {
    window.open('/PrivacyPolicy.html', '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  // Split categories into two columns
  const splitCategoriesIntoColumns = () => {
    if (categories.length === 0) return { leftColumn: [], rightColumn: [] };
    
    const half = Math.ceil(categories.length / 2);
    return {
      leftColumn: categories.slice(0, half),
      rightColumn: categories.slice(half)
    };
  };

  const { leftColumn, rightColumn } = splitCategoriesIntoColumns();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* App Download Section */}
        <div className="app-download-section">
          <div className="app-content">
            <div className="app-text">
              <h3>Get the Ironing Boy App</h3>
              <p>Download our app for faster booking, order tracking, and exclusive offers</p>
              <div className="app-buttons">
                <button className="app-btn android-btn" onClick={handleGetApp}>
                  <i className="fab fa-google-play"></i>
                  <div className="btn-text">
                    <span className="get-on">GET IT ON</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
                <button className="app-btn apple-btn" onClick={handleGetApp}>
                  <i className="fab fa-apple"></i>
                  <div className="btn-text">
                    <span className="download-on">Download on the</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="app-illustration">
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
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column services-column">
              <h4>Our Services</h4>
              <div className="services-grid">
                {loading ? (
                  <div className="loading-text">Loading services...</div>
                ) : categories.length === 0 ? (
                  <div className="no-services-text">No services available</div>
                ) : (
                  <>
                    <div className="services-column-left">
                      <ul className="services-list">
                        {leftColumn.map((category) => (
                          <li key={category.id}>
                            <button 
                              className="category-link"
                              onClick={() => handleCategoryClick(category)}
                              aria-label={`View ${category.name} services`}
                            >
                              {category.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="services-column-right">
                      <ul className="services-list">
                        {rightColumn.map((category) => (
                          <li key={category.id}>
                            <button 
                              className="category-link"
                              onClick={() => handleCategoryClick(category)}
                              aria-label={`View ${category.name} services`}
                            >
                              {category.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => navigate('/services')} className="footer-link">Services</button></li>
                <li><button onClick={() => navigate('/areas')} className="footer-link">Areas</button></li>
                <li><button onClick={() => navigate('/pricing')} className="footer-link">Pricing</button></li>
                <li><button onClick={() => navigate('/how-it-works')} className="footer-link">How It Works</button></li>
                <li><button onClick={() => navigate('/faq')} className="footer-link">FAQ</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact Info</h4>
              <ul className="contact-info">
                <li>
                  <i className="fas fa-phone"></i>
                  <span>+44 02031231010</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>support@ironingboy.com</span>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>2 Turnpike Lane, Uxbridge, Hillingdon, UB10 0AH, UK</span>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Stay Updated</h4>
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

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="payment-section">
            <span className="payment-label">We Accept:</span>
            <div className="payment-methods">
              <i className="fab fa-cc-visa" title="Visa"></i>
              <i className="fab fa-cc-mastercard" title="Mastercard"></i>
              <i className="fab fa-cc-paypal" title="PayPal"></i>
            </div>
          </div>

          <div className="copyright">
            <p>&copy; 2025 Ironing Boy. All rights reserved.</p>
            <div className="legal-links">
              <button 
                onClick={handlePrivacyClick} 
                className="footer-link legal-link"
                title="Opens Privacy Policy in new window"
              >
                Privacy Policy <i className="fas fa-external-link-alt external-icon"></i>
              </button>
              <button 
                onClick={handleTermsClick} 
                className="footer-link legal-link"
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