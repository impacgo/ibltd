// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Login successful:', formData);

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);

      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@ironingboy.com',
      password: 'demo123'
    });
  };

  return (
    <div className="login-page">

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">🧺</div>
              <div className="logo-text">Ironing Boy</div>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="demo-section">
              <button 
                type="button" 
                className="demo-button"
                onClick={handleDemoLogin}
              >
                Use Demo Credentials
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Expert Fabric Care</h3>
            <p>Advanced cleaning methods for premium garments</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧼</div>
            <h3>Premium Stain Treatment</h3>
            <p>Targeted solutions for tough stains</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Easy Payments</h3>
            <p>Save payment methods for faster checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
