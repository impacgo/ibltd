// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

// Icons (you can replace with your preferred icon library)
const ProfileIcon = () => (
  <svg className="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const AppIcon = () => (
  <svg className="app-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 2H7C4.79086 2 3 3.79086 3 6V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V6C21 3.79086 19.2091 2 17 2Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Temporary text-based logo - replace with your actual logo file
const TextLogo = () => (
  <div className="logo-text">
    <span className="logo-name">IRONING BOY</span>
    <span className="logo-tagline">Professional Laundry Services</span>
  </div>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <TextLogo />
          </Link>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link ${isActiveLink('/')}`}
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/services" 
                  className={`nav-link ${isActiveLink('/services')}`}
                  onClick={closeMenu}
                >
                  Services
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/pricing" 
                  className={`nav-link ${isActiveLink('/pricing')}`}
                  onClick={closeMenu}
                >
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/how-it-works" 
                  className={`nav-link ${isActiveLink('/how-it-works')}`}
                  onClick={closeMenu}
                >
                  How It Works
                </Link>
              </li>
             
              <li className="nav-item">
                <Link 
                  to="/faq" 
                  className={`nav-link ${isActiveLink('/faq')}`}
                  onClick={closeMenu}
                >
                  FAQ
                </Link>
              </li>
               <li className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActiveLink('/login')}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              
              {/* Mobile-only items */}
              <li className="nav-item mobile-only">
                <Link 
                  to="/get-app" 
                  className="nav-link get-app-mobile"
                  onClick={closeMenu}
                >
                  <AppIcon />
                  Get Our App
                </Link>
              </li>
             {/* <li className="nav-item mobile-only">
                <Link 
                  to="/login" 
                  className="nav-link login-mobile"
                  onClick={closeMenu}
                >
                  <ProfileIcon />
                </Link>
              </li>*/}
            </ul>
          </nav>

          {/* Header Actions - Desktop */}
          <div className="header-actions desktop-only">
            <Link 
              to="/get-app" 
              className="get-app-btn"
            >
              <AppIcon />
              Get App
            </Link>
            <Link 
              to="/" 
              className="profile-btn"
              title="Login to your account"
            >
              <ProfileIcon />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMenu}></div>
      )}
    </header>
  );
};

export default Header;