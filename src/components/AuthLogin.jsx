// src/components/AuthLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../images/logo1.svg";

const AuthLogin = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: ""
  });
  const [signupFormData, setSignupFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Login successful:", loginFormData);
    navigate("/");
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Signup successful:", signupFormData);
    navigate("/");
    setIsLoading(false);
  };

  const flipToSignup = () => setIsFlipped(true);
  const flipToLogin = () => setIsFlipped(false);

  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className="auth-container">
          <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>

            {/* FORMS */}
            <div className="forms-container">

              {/* LOGIN */}
              <div className={`form-section login-section ${isFlipped ? "hidden" : "active"}`}>
                <div className="form-content">
                  <div className="form-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your Ironing Boy account</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={loginFormData.email}
                          onChange={handleLoginChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={loginFormData.password}
                          onChange={handleLoginChange}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-options">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Remember me
                      </label>

                      <Link to="/forgot-password" className="forgot-link">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`auth-btn ${isLoading ? "loading" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Signing In...
                        </>
                      ) : (
                        "Sign In to Your Account"
                      )}
                    </button>
                  </form>

                  <div className="auth-switch">
                    <p>
                      New to Ironing Boy?{" "}
                      <button type="button" onClick={flipToSignup} className="switch-link">
                        Create an account
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* SIGNUP */}
              <div className={`form-section signup-section ${isFlipped ? "active" : "hidden"}`}>
                <div className="form-content">
                  <div className="form-header">
                    <h1>Create Account</h1>
                    <p>Join Our Happy Customer Member Today</p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="auth-form">

                    <div className="form-group">
                      <label htmlFor="signupEmail">Email Address</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="signupEmail"
                          name="email"
                          value={signupFormData.email}
                          onChange={handleSignupChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupPassword">Password</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="signupPassword"
                          name="password"
                          value={signupFormData.password}
                          onChange={handleSignupChange}
                          placeholder="Create a password"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={signupFormData.confirmPassword}
                          onChange={handleSignupChange}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-options">
                      <label className="checkbox">
                        <input type="checkbox" required />
                        <span className="checkmark"></span>
                        I agree to the Terms & Conditions
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`auth-btn ${isLoading ? "loading" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>

                  <div className="auth-switch">
                    <p>
                      Already have an account?{" "}
                      <button type="button" onClick={flipToLogin} className="switch-link">
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BRAND SIDE */}
            <div className="brand-side">
              <div className="brand-content">
                <div className="brand-logo">
                  <img src={logo} alt="Ironing Boy" />
                </div>

                <div className="brand-text">
                  <h2>Premium Laundry Service</h2>
                  <p>Where Luxury Meets Freshness</p>
                </div>

                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">✨</div>
                    <div className="feature-text">
                      <h4>Expert Fabric Care</h4>
                      <p>Advanced methods for delicate garments</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">🧼</div>
                    <div className="feature-text">
                      <h4>Premium Stain Treatment</h4>
                      <p>Deep stain removal solutions</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">🚚</div>
                    <div className="feature-text">
                      <h4>Free Pickup</h4>
                      <p>Convenient doorstep service</p>
                    </div>
                  </div>
                </div>

                <div className="brand-stats">
                  <div className="stat-item">
                    <div className="stat-number">10,000+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLogin;
