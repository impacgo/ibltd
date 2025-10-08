// src/components/ComingSoon.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ComingSoon.css';
import logo from "../images/logo1.svg";

const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "We're working hard to bring you this amazing feature. Stay tuned for updates!",
  featureName = "This feature",
  expectedTime = "Soon"
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Email submitted:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-container">
        <div className="coming-soon-card">
          {/* Header Section */}
          <div className="coming-soon-header">
            <div className="logo-container" style={{background:"none"}}>
              <div className="app-logo" style={{background:"none"}}>
                <div className="logo-icon"><img src={logo} style={{height:"50px",width:"50px", borderRadius:"25%"}}/></div>
              </div>
              <span className="app-name">IroningBoy</span>
            </div>
            <div className="status-badge">
              <span className="status-dot"></span>
              Under Development
            </div>
          </div>

          {/* Main Content */}
          <div className="coming-soon-content">
            {/* Animated Illustration */}
            <div className="illustration-container">
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
              <div className="main-illustration">
                <div className="gear gear-1">⚙️</div>
                <div className="gear gear-2">🔧</div>
                <div className="code-icon">{`</>`}</div>
              </div>
            </div>

            {/* Text Content */}
            <div className="content-text">
              <h1 className="title">{title}</h1>
              <p className="description">{description}</p>
              
              {/* Feature Stats */}
              <div className="feature-stats">
                <div className="stat">
                  <div className="stat-value">75%</div>
                  <div className="stat-label">Progress</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{expectedTime}</div>
                  <div className="stat-label">Launch</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{featureName}</div>
                  <div className="stat-label">Feature</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-header">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>

            {/* Notification Form */}
            <div className="notification-section">
              <h3>Get Notified at Launch</h3>
              <p>We'll send you an email when this feature goes live</p>
              
              {isSubscribed ? (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  Thank you! We'll notify you when we launch.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="notification-form">
                  <div className="input-container">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" 
                      required 
                    />
                    <button type="submit" className="subscribe-btn">
                      Notify Me
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-section">
              <Link to="/services" className="action-btn secondary">
                Explore Available Features
              </Link>
            </div>

            {/* Footer */}
            <div className="coming-soon-footer">
              <p>Follow our journey</p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;