// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const AppleIcon = () => (
  <svg className="store-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 12.04C17.02 9.28 19.36 8.01 19.46 7.96C18.17 6.12 16.18 5.87 15.56 5.85C13.87 5.7 12.24 6.82 11.41 6.82C10.56 6.82 9.21 5.87 7.79 5.9C5.95 5.93 4.28 6.87 3.34 8.43C1.38 11.61 2.72 16.28 4.54 18.87C5.47 20.15 6.56 21.58 7.97 21.53C9.34 21.48 9.85 20.65 11.53 20.65C13.2 20.65 13.68 21.53 15.11 21.5C16.57 21.48 17.53 20.19 18.42 18.9C19.52 17.45 20 16.02 20.02 15.96C19.97 15.94 17.08 14.86 17.05 12.04ZM14.82 4.5C15.41 3.74 15.85 2.72 15.7 1.75C14.84 1.78 13.77 2.32 13.14 3.07C12.58 3.73 12.05 4.78 12.22 5.72C13.16 5.8 14.17 5.24 14.82 4.5Z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="store-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.3-.16-.69-.04-.85.26L16.48 8.6C14.93 7.95 13.13 7.6 11.2 7.6s-3.73.35-5.28 1l-1.85-3.19c-.16-.3-.55-.42-.85-.26-.3.16-.42.55-.26.85L4.8 9.48C2.9 10.77 1.6 12.76 1.6 15c0 3.23 2.57 5.8 5.8 5.8h11.2c3.23 0 5.8-2.57 5.8-5.8 0-2.24-1.3-4.23-3.2-5.52zM7.4 16.2c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2zm9.2 0c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2z"/>
  </svg>
);

const TextLogo = () => (
  <div className="logo-text">
    <span className="logo-name">IRONING BOY</span>
    <span className="logo-tagline">Professional Laundry Services</span>
  </div>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastY, setLastY] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("scroll", () => setIsScrolled(window.scrollY > 20));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHideHeader(currentY > lastY && currentY > 80);
      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleStoreClick = (type) => {
    navigate('/coming-soon', { state: { storeType: type } });
    closeMenu();
  };

  const isActiveLink = (path) =>
    location.pathname === path ? 'active' : '';

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${hideHeader ? 'hide-header' : ''}`}>
      <div className="header-container">
        <div className="header-content">

          <div className="header-left">
            <Link to="/" className="logo" onClick={closeMenu}>
              <TextLogo />
            </Link>

            <div className="app-store-icons mobile-only">
              <button className="store-btn apple-btn" onClick={() => handleStoreClick("ios")}>
                <AppleIcon /> <span>App Store</span>
              </button>
              <button className="store-btn android-btn" onClick={() => handleStoreClick("android")}>
                <AndroidIcon /> <span>Google Play</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
            <ul className="nav-list">
              <li><Link to="/" className={`nav-link ${isActiveLink('/')}`} onClick={closeMenu}>Home</Link></li>
              <li><Link to="/services" className={`nav-link ${isActiveLink('/services')}`} onClick={closeMenu}>Services</Link></li>
              <li><Link to="/pricing" className={`nav-link ${isActiveLink('/pricing')}`} onClick={closeMenu}>Pricing</Link></li>
              <li><Link to="/how-it-works" className={`nav-link ${isActiveLink('/how-it-works')}`} onClick={closeMenu}>How It Works</Link></li>
              <li><Link to="/faq" className={`nav-link ${isActiveLink('/faq')}`} onClick={closeMenu}>FAQ</Link></li>
              <li><Link to="/login" className={`nav-link ${isActiveLink('/login')}`} onClick={closeMenu}>Login</Link></li>
            </ul>
          </nav>

          {/* Desktop Store Buttons */}
          <div className="header-actions desktop-only">
            <button className="store-btn-desktop apple-btn" onClick={() => handleStoreClick("ios")}>
              <AppleIcon />
              <div className="store-text">
                <span className="store-label">Download on the</span>
                <span className="store-name">App Store</span>
              </div>
            </button>

            <button className="store-btn-desktop android-btn" onClick={() => handleStoreClick("android")}>
              <AndroidIcon />
              <div className="store-text">
                <span className="store-label">Get it on</span>
                <span className="store-name">Google Play</span>
              </div>
            </button>
          </div>

          <button className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>

        </div>
      </div>

      {isMenuOpen && <div className="mobile-menu-backdrop" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;
