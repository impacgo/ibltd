import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import LoginPopup from "./LoginPopup";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://51.21.123.162:3000";

// Optimized SVG Icons with better styling
const AppleIcon = () => (
  <svg className="store-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M17.05 12.04c-.03-2.76 2.31-4.03 2.41-4.08-1.29-1.84-3.28-2.09-3.9-2.11-1.69-.15-3.32.97-4.15.97-.85 0-2.2-.95-3.62-.92C5.94 5.93 4.27 6.87 3.33 8.43c-1.96 3.18-.62 7.85 1.2 10.44 0.93 1.28 2.02 2.71 3.43 2.66 1.37-.05 1.88-.88 3.56-.88 1.67 0 2.15.88 3.58.85 1.46-.02 2.42-1.31 3.31-2.6 1.1-1.45 1.58-2.88 1.6-2.94-.05-.02-2.94-1.1-2.97-3.92z"/>
    <path fill="currentColor" d="M14.82 4.5c.59-.76 1.03-1.78.88-2.75-.86.03-1.93.57-2.56 1.32-.56.66-1.09 1.71-.92 2.65.94.08 1.95-.48 2.6-1.22z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="store-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M17.6 9.48l1.84-3.18a.67.67 0 0 0-.26-.85.67.67 0 0 0-.85.26L16.48 8.6c-1.55-.65-3.35-1-5.28-1s-3.73.35-5.28 1L4.07 5.71a.67.67 0 1 0-1.11.59l1.84 3.18C2.9 10.77 1.6 12.76 1.6 15c0 3.23 2.57 5.8 5.8 5.8h11.2c3.23 0 5.8-2.57 5.8-5.8 0-2.24-1.3-4.23-3.2-5.52zM7.4 16.2c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2zm9.2 0c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" fill="none"/>
  </svg>
);

const ArrowIcon = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={isOpen ? "M6 15L12 9L18 15" : "M9 6L15 12L9 18"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TextLogo = ({ colorOnMobile = false }) => (
  <div className={`logo-text ${colorOnMobile ? "mobile-white" : ""}`} aria-hidden="true">
    <span className="logo-name">IRONING BOY</span>
    <span className="logo-tagline">Professional Laundry Services</span>
  </div>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isMobileServiceOpen, setIsMobileServiceOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState("U");

  // Use AuthContext for user state
  const { user, logout } = useAuth();

  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Function to get user display name with enhanced debugging
  const getUserDisplayName = () => {
    console.log("🔄 getUserDisplayName called with user:", user);
    
    if (!user) {
      console.log("❌ No user object");
      return "U";
    }
    
    // Check user object structure
    console.log("📋 User object keys:", Object.keys(user));
    console.log("📋 User object values:", user);
    
    // Try multiple possible name fields in priority order
    const nameSources = [
      user.name,                    // Full name
      user.full_name,              // Alternative full name field
      user.first_name,             // First name
      user.username,               // Username
      user.email,                  // Email (extract name part)
      user.phone,                  // Phone (last resort)
      user.identifier              // Generic identifier
    ];
    
    for (const source of nameSources) {
      if (source && typeof source === 'string') {
        console.log("✅ Found name source:", source);
        
        // Clean the name source
        const cleanSource = source.trim();
        
        // For email addresses, extract the part before @
        if (cleanSource.includes('@')) {
          const namePart = cleanSource.split('@')[0];
          // Remove numbers and special characters
          const cleanName = namePart.replace(/[^a-zA-Z]/g, '');
          if (cleanName.length > 0) {
            console.log("📧 Extracted from email:", cleanName.charAt(0).toUpperCase());
            return cleanName.charAt(0).toUpperCase();
          }
        }
        
        // For phone numbers, check if it's actually a name
        else if (/^\d+$/.test(cleanSource)) {
          console.log("📱 Source is phone number, skipping");
          continue;
        }
        
        // For regular text, check if it contains letters
        else if (/[a-zA-Z]/.test(cleanSource)) {
          console.log("🔤 Source contains letters:", cleanSource.charAt(0).toUpperCase());
          return cleanSource.charAt(0).toUpperCase();
        }
      }
    }
    
    console.log("⚠️ No valid name found, defaulting to 'U'");
    return "U";
  };

  // Update user initial when user changes
  useEffect(() => {
    if (user) {
      console.log("👤 User changed, updating initial");
      const initial = getUserDisplayName();
      console.log("✅ Setting user initial to:", initial);
      setUserInitial(initial);
    } else {
      setUserInitial("U");
    }
  }, [user]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled(y > 20);
          setHideHeader(y > lastY && y > 80);
          setLastY(y);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setShowProfileMenu(false);
        setIsServiceOpen(false);
        setIsMobileServiceOpen(false);
        document.body.style.overflow = "";
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path) => location.pathname === path ? "active" : "";

  const handleLogout = useCallback(() => {
    console.log("🚪 Logging out user");
    logout(); // Use logout from AuthContext
    setShowProfileMenu(false);
    setUserInitial("U");
  }, [logout]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      if (!next) {
        setIsMobileServiceOpen(false);
      }
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsMobileServiceOpen(false);
    document.body.style.overflow = "";
  }, []);

  const toggleServiceDropdown = useCallback((e) => {
    e.stopPropagation();
    setIsServiceOpen(prev => !prev);
  }, []);

  const toggleMobileServiceDropdown = useCallback(() => {
    setIsMobileServiceOpen(prev => !prev);
  }, []);

  // Professional app store button handlers
  const handleAppStoreClick = () => {
    window.open("https://apps.apple.com", "_blank");
  };

  const handlePlayStoreClick = () => {
    window.open("https://play.google.com", "_blank");
  };

  const handleLoginSuccess = () => {
    console.log("✅ Login successful");
    setShowLogin(false);
    // AuthContext will automatically update the user state
  };

  // Navigate to order history
  const goToOrderHistory = () => {
    console.log("📦 Navigating to order history");
    setShowProfileMenu(false);
    navigate("/orders");
  };

  // Navigate to profile
  const goToProfile = () => {
    console.log("👤 Navigating to profile");
    setShowProfileMenu(false);
    navigate("/profile");
  };

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""} ${hideHeader ? "hide-header" : ""}`}>
        <div className="header-container">
          <div className="header-content">
            {/* MOBILE HEADER - Two Row Layout */}
            <div className="header-top-row">
              {/* Logo on Left */}
              <div className="header-left">
                <Link to="/" className="logo" onClick={closeMenu} aria-label="Ironing Boy Home">
                  <TextLogo />
                </Link>
              </div>

              {/* Menu Icon on Right */}
              <button
                ref={menuButtonRef}
                className="mobile-menu-btn"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <MenuIcon />
              </button>
            </div>

            {/* App Store Icons Row - Below Logo */}
            <div className="header-apps-row">
              <div className="mobile-app-icons">
                <button 
                  className="mini-store-btn apple-btn"
                  onClick={handleAppStoreClick}
                  aria-label="Download on the App Store"
                >
                  <AppleIcon />
                  <div className="mini-store-text">
                    <span className="mini-store-label">Download on the</span>
                    <span className="mini-store-name">App Store</span>
                  </div>
                </button>

                <button 
                  className="mini-store-btn android-btn"
                  onClick={handlePlayStoreClick}
                  aria-label="Get it on Google Play"
                >
                  <AndroidIcon />
                  <div className="mini-store-text">
                    <span className="mini-store-label">Get it on</span>
                    <span className="mini-store-name">Google Play</span>
                  </div>
                </button>
              </div>
              {/* Spacer to align with menu icon */}
              <div className="header-apps-spacer"></div>
            </div>

            {/* Desktop Navigation */}
            <nav className="nav desktop" aria-label="Primary navigation">
              <ul className="nav-list">
                <li>
                  <Link className={`nav-link ${isActive("/")}`} to="/">Home</Link>
                </li>

                <li className="dropdown" ref={dropdownRef}>
                  <button
                    className={`nav-link dropdown-toggle ${isServiceOpen ? "active" : ""}`}
                    onClick={toggleServiceDropdown}
                    aria-expanded={isServiceOpen}
                    aria-haspopup="true"
                  >
                    Services <ArrowIcon isOpen={isServiceOpen} />
                  </button>

                  <ul className={`dropdown-menu ${isServiceOpen ? "show" : ""}`} role="menu">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <li key={category.id}>
                          <Link 
                            to={`/category/${category.id}`} 
                            onClick={() => setIsServiceOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li><span className="dropdown-placeholder">Loading...</span></li>
                    )}
                  </ul>
                </li>

                <li><Link className={`nav-link ${isActive("/areas")}`} to="/areas">Areas</Link></li>
                <li><Link className={`nav-link ${isActive("/pricing")}`} to="/pricing">Pricing</Link></li>
                <li><Link className={`nav-link ${isActive("/how-it-works")}`} to="/how-it-works">How It Works</Link></li>
                <li><Link className={`nav-link ${isActive("/faq")}`} to="/faq">FAQ</Link></li>
              </ul>
            </nav>

            {/* Desktop Actions - Professional App Store Buttons */}
            <div className="header-actions desktop-only">
              <div className="app-store-buttons">
                <button 
                  className="store-btn-desktop apple-btn"
                  onClick={handleAppStoreClick}
                  aria-label="Download on the App Store"
                >
                  <AppleIcon />
                  <div className="store-text">
                    <span className="store-label">Download on the</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>

                <button 
                  className="store-btn-desktop android-btn"
                  onClick={handlePlayStoreClick}
                  aria-label="Get it on Google Play"
                >
                  <AndroidIcon />
                  <div className="store-text">
                    <span className="store-label">Get it on</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
              </div>

              {/* User Profile Area */}
              <div ref={profileRef} className="profile-area">
                {!user ? (
                  <button 
                    className="profile-icon-btn" 
                    onClick={() => setShowLogin(true)}
                    aria-label="Login or Sign up"
                  >
                    <ProfileIcon />
                  </button>
                ) : (
                  <>
                    <div 
                      className="profile-avatar-logged" 
                      onClick={() => setShowProfileMenu(prev => !prev)}
                      title={`User: ${userInitial}`}
                      aria-label="User profile"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setShowProfileMenu(prev => !prev)}
                    >
                      {userInitial}
                    </div>

                    {showProfileMenu && (
                      <div className="profile-dropdown" role="menu">
                        <div className="profile-header">
                          <div className="profile-avatar-small">{userInitial}</div>
                          <div className="profile-info">
                            <div className="profile-welcome">Welcome</div>
                            <div className="profile-email">{user.email || user.phone || user.identifier || "User"}</div>
                          </div>
                        </div>
                        <div className="profile-divider"></div>
                        <button 
                          className="profile-option" 
                          onClick={goToProfile}
                        >
                          <i className="fas fa-user-circle"></i> Personal Info
                        </button>
                        <button 
                          className="profile-option" 
                          onClick={goToOrderHistory}
                        >
                          <i className="fas fa-history"></i> Order History
                        </button>
                        <div className="profile-divider"></div>
                        <button 
                          className="profile-option logout-option" 
                          onClick={handleLogout}
                        >
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel with Glass Effect */}
        <nav 
          className={`nav mobile ${isMenuOpen ? "active" : ""}`} 
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
        >
          <div className="mobile-menu-header">
            <div className="mobile-header-user">
              {user ? (
                <div className="mobile-user-initials">
                  <div className="mobile-user-avatar-large">{userInitial}</div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-welcome">Welcome</div>
                    <div className="mobile-user-email">{user.email || user.phone || user.identifier || "User"}</div>
                  </div>
                </div>
              ) : (
                <TextLogo colorOnMobile={true} />
              )}
            </div>
            <button 
              className="mobile-close" 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mobile-menu-content">
            <ul className="mobile-nav-list">
              <li>
                <Link 
                  className={`mobile-menu-item ${isActive("/")}`} 
                  to="/" 
                  onClick={closeMenu}
                >
                  <span className="menu-item-icon">🏠</span>
                  <span className="menu-item-text">Home</span>
                </Link>
              </li>

              {/* Mobile Services Dropdown */}
              <li className="mobile-dropdown-item">
                <button
                  className={`mobile-menu-item mobile-dropdown-toggle ${isMobileServiceOpen ? "active" : ""}`}
                  onClick={toggleMobileServiceDropdown}
                  aria-expanded={isMobileServiceOpen}
                >
                  <span className="menu-item-icon">✨</span>
                  <span className="menu-item-text">Services</span>
                  <ArrowIcon isOpen={isMobileServiceOpen} />
                </button>

                <div className={`mobile-dropdown-content ${isMobileServiceOpen ? "show" : ""}`}>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category.id}
                        to={`/category/${category.id}`} 
                        onClick={closeMenu}
                        className="dropdown-link"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <span className="dropdown-placeholder">Loading...</span>
                  )}
                </div>
              </li>

              <li>
                <Link className="mobile-menu-item" to="/areas" onClick={closeMenu}>
                  <span className="menu-item-icon">📍</span>
                  <span className="menu-item-text">Areas</span>
                </Link>
              </li>
              <li>
                <Link className="mobile-menu-item" to="/pricing" onClick={closeMenu}>
                  <span className="menu-item-icon">💰</span>
                  <span className="menu-item-text">Pricing</span>
                </Link>
              </li>
              <li>
                <Link className="mobile-menu-item" to="/how-it-works" onClick={closeMenu}>
                  <span className="menu-item-icon">⚙️</span>
                  <span className="menu-item-text">How It Works</span>
                </Link>
              </li>
              <li>
                <Link className="mobile-menu-item" to="/faq" onClick={closeMenu}>
                  <span className="menu-item-icon">❓</span>
                  <span className="menu-item-text">FAQ</span>
                </Link>
              </li>

              <div className="mobile-nav-divider"></div>

              {/* User Section */}
              {!user ? (
                <>
                  <li>
                    <button 
                      className="mobile-auth-btn primary"
                      onClick={() => { 
                        closeMenu(); 
                        setShowLogin(true); 
                      }}
                    >
                      <span className="menu-item-icon">👤</span>
                      <span className="menu-item-text">Login / Signup</span>
                    </button>
                  </li>
                  <li className="mobile-auth-note">
                    <p>Sign up to get exclusive discounts and track your orders</p>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button 
                      className="mobile-profile-btn" 
                      onClick={() => { 
                        navigate("/profile"); 
                        closeMenu(); 
                      }}
                    >
                      <span className="menu-item-icon">👤</span>
                      <span className="menu-item-text">Personal Info</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className="mobile-profile-btn" 
                      onClick={() => { 
                        navigate("/orders"); 
                        closeMenu(); 
                      }}
                    >
                      <span className="menu-item-icon">📦</span>
                      <span className="menu-item-text">Order History</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className="mobile-profile-btn logout" 
                      onClick={() => { 
                        handleLogout(); 
                        closeMenu(); 
                      }}
                    >
                      <span className="menu-item-icon">🚪</span>
                      <span className="menu-item-text">Logout</span>
                    </button>
                  </li>
                </>
              )}
            </ul>

            {/* App Store Buttons at the END of mobile menu */}
            <div className="mobile-app-section">
              <div className="mobile-app-header">
                <h3>Get Our App</h3>
                <p>Faster booking and exclusive mobile-only offers</p>
              </div>
              <div className="mobile-app-buttons">
                <button 
                  className="mobile-store-btn apple-btn" 
                  onClick={handleAppStoreClick}
                  aria-label="Download on App Store"
                >
                  <AppleIcon />
                  <div className="mobile-store-text">
                    <span className="mobile-store-label">Download on the</span>
                    <span className="mobile-store-name">App Store</span>
                  </div>
                </button>
                <button 
                  className="mobile-store-btn android-btn" 
                  onClick={handlePlayStoreClick}
                  aria-label="Get on Google Play"
                >
                  <AndroidIcon />
                  <div className="mobile-store-text">
                    <span className="mobile-store-label">Get it on</span>
                    <span className="mobile-store-name">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Backdrop */}
        <div
          className={`mobile-menu-backdrop ${isMenuOpen ? "show" : ""}`}
          onClick={closeMenu}
          aria-hidden={!isMenuOpen}
          role="presentation"
        />
      </header>

      {/* Login Popup */}
      {showLogin && (
        <LoginPopup
          close={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;