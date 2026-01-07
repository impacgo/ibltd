// src/components/Footer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from "../images/logo1.svg";

const Footer = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail('');
    }
  };

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
                    <div className="app-icon"><img src={logo} style={{height:"70px",width:"70px",borderRadius:"25%"}}/></div>
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
            <div className="footer-column">
              <h4>Our Services</h4>
              <ul>
                <li><a href="#">Cloth Clean & Iron</a></li>
                <li><a href="#">Dry Cleaning</a></li>
                <li><a href="#">Alterations & Repairs</a></li>
                <li><a href="#">Household Items</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Testimonials</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact Info</h4>
              <ul className="contact-info">
                <li>
                  <i className="fas fa-phone"></i>
                  <span>020 7060 4939</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>info@ironingboy.com</span>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>London, UK</span>
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
                  />
                  <button type="submit" className="send-button">
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
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;