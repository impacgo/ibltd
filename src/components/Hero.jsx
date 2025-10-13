import React, { useState, useEffect } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import './Hero.css';
import backgroundImage from "../images/herosec.jpg";

const Hero = () => {
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (location.trim()) {
      scrollToSection('services');
    }
  };

  const features = [
    { icon: '⚡', text: '2-Hour Express Delivery' },
    { icon: '👔', text: 'Expert Fabric Care' },
    { icon: '🌿', text: 'Eco-Friendly Products' },
    { icon: '🏠', text: 'Free Pickup & Delivery' }
  ];

  return (
    <section className={`hero ${isVisible ? 'visible' : ''}`}>
      {/* Animated Background with Parallax (disabled on mobile) */}
      <div 
        className="hero-background"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: isMobile ? 'none' : `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="gradient-overlay top"></div>
      <div className="gradient-overlay bottom"></div>
      
      {/* Floating Particles (reduced on mobile) */}
      <div className="particles">
        {[...Array(isMobile ? 8 : 15)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="hero-container">
        {/* Left Content */}
        <div className="content-left">
          <div className="premium-badge">
            <div className="sparkle">✨</div>
            <span>Trusted by 10,000+ Happy Customers</span>
          </div>

          <div className="main-headline">
            <div className="eyebrow">PREMIUM LAUNDRY SERVICE</div>
            <h1>
              <span className="static-text">Where Luxury Meets</span>
              <br />
              <span className="animated-text">
                <Typewriter
                  words={[
                    'Freshness',
                    'Convenience',
                    'Perfection',
                    'Care'
                  ]}
                  loop
                  cursor
                  cursorStyle="|"
                  typeSpeed={80}
                  deleteSpeed={50}
                  delaySpeed={2000}
                />
              </span>
            </h1>
          </div>

          <p className="hero-description">
            Experience the future of laundry care. We combine cutting-edge technology 
            with artisan techniques to deliver impeccable results that make your 
            clothes look and feel brand new, every single time.
          </p>

          {/* Enhanced Interactive Location Finder */}
          <div className="location-finder highlighted" style={{animation:"none"}}>
            <div className="finder-header" style={{animation:"none"}}>
              <i className="fas fa-crosshairs"></i>
              <span>Find Service in Your Area</span>
            </div>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Enter your address or zip code..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetStarted()}
                className="location-input"
              />
              <button 
                className={`find-btn ${location ? 'active' : ''}`}
                onClick={handleGetStarted}
              >
                <span>Check Availability</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="location-hint">
              <i className="fas fa-info-circle"></i>
              <span>Enter your location to check service availability and pricing</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-icon">✅</div>
              <span>Same-Day Service Available</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🛡️</div>
              <span>Quality Guarantee</span>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💸</div>
              <span>Minimum charges £20</span>
            </div>
          </div>
        </div>

        {/* Right Content - Feature Cards */}
        <div className="content-right">
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">{feature.text}</div>
              </div>
            ))}
          </div>

          {/* CTA Card */}
          <div className="cta-card">
            <div className="offer-badge">
              <span>SPECIAL OFFER</span>
            </div>
            <h3>First-Time Customer?</h3>
            <p>Get <strong>30% OFF</strong> your first order + free delivery</p>
            <button className="offer-btn">
              Claim Your Discount
              <i className="fas fa-gift"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="stats-bar">
        <div className="stat" style={{background:"none", border:"none"}}>
          <div className="stat-number">50K+</div>
          <div className="stat-label">Items Cleaned</div>
        </div>
        <div className="stat" style={{background:"none", border:"none"}}>
          <div className="stat-number">4.9★</div>
          <div className="stat-label">Customer Rating</div>
        </div>
        <div className="stat" style={{background:"none", border:"none"}}>
          <div className="stat-number">24/7</div>
          <div className="stat-label">Support</div>
        </div>
        <div className="stat" style={{background:"none", border:"none"}}>
          <div className="stat-number">98%</div>
          <div className="stat-label">On Time</div>
        </div>
      </div>

      
    </section>
  );
};

export default Hero;