import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ThankYouPage.css';

const API_BASE = "https://api.ironingboy.com";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    status: 'Confirmed',
    estimatedDelivery: '24-48 hours',
    pickupTime: '',
    userName: '',
    userEmail: '',
    orderDate: '',
    totalAmount: '£0.00 (Will be charged after invoice)',
    paymentMethod: 'Card saved for auto-payment',
    serviceType: 'Express Laundry',
    paymentStatus: 'card_saved'
  });

  const [error, setError] = useState(null);
  const [confetti, setConfetti] = useState(true);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('jwtToken');
        let orderData = {};
        
        // Check location state first (from QuickBooking navigation)
        if (location.state?.orderId) {
          orderData = {
            orderId: location.state.orderId,
            paymentStatus: location.state.paymentStatus || 'card_saved',
            ...location.state
          };
        }

        // Try to get order from localStorage
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder);
            orderData = { ...orderData, ...parsedOrder };
          } catch (e) {
            console.error('Error parsing localStorage order:', e);
          }
        }

        // If we have a token, fetch user profile
        if (token) {
          try {
            const profileRes = await fetch(`${API_BASE}/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (profileRes.ok) {
              const profileData = await profileRes.json();
              
              // Merge with user data
              setOrderDetails(prev => ({
                ...prev,
                ...orderData,
                userName: profileData.name || 'Valued Customer',
                userEmail: profileData.email || '',
                orderId: orderData.orderId || `IB-${Date.now().toString().slice(-8)}`,
                status: 'Confirmed',
                pickupTime: orderData.pickupTime || orderData.collect_slot || 'Today, 4-6 PM',
                estimatedDelivery: orderData.estimatedDelivery || orderData.delivery_slot || '24-48 hours',
                orderDate: orderData.orderDate || new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                totalAmount: orderData.totalAmount || '£0.00 (Will be charged after invoice)',
                paymentMethod: orderData.paymentMethod || 'Card saved for auto-payment',
                paymentStatus: orderData.paymentStatus || 'card_saved',
                serviceType: orderData.serviceType || 'Express Laundry'
              }));
            } else {
              // Use localStorage data if profile fetch fails
              setOrderDetails(prev => ({
                ...prev,
                ...orderData,
                userName: user?.name || 'Valued Customer',
                orderDate: new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }));
            }
          } catch (apiError) {
            console.error('API Error:', apiError);
            // Fallback to localStorage data
            if (orderData.orderId) {
              setOrderDetails(prev => ({
                ...prev,
                ...orderData,
                userName: user?.name || 'Valued Customer',
                orderDate: new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }));
            }
          }
        } else {
          // No token, use localStorage data
          setOrderDetails(prev => ({
            ...prev,
            ...orderData,
            userName: 'Valued Customer',
            orderDate: new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }));
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Unable to load order details.');
        
        // Fallback to basic data
        setOrderDetails(prev => ({
          ...prev,
          orderId: `IB-${Date.now().toString().slice(-8)}`,
          userName: user?.name || 'Valued Customer',
          orderDate: new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

    // Create confetti effect
    const createConfetti = () => {
      const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
      const container = document.querySelector('.confetti-container');
      if (!container) return;

      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(confetti);
      }
    };

    if (confetti) {
      createConfetti();
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, location.state]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBookAnother = () => {
    navigate('/services');
  };

  if (loading) {
    return (
      <div className="thankyou-container">
        <div className="thankyou-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2 style={{ color: '#1f2937' }}>Loading Your Order Details...</h2>
            <p style={{ color: '#6b7280' }}>Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thankyou-container">
      {/* Confetti Effect */}
      {confetti && <div className="confetti-container"></div>}

      <div className="thankyou-card">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-wrapper">
            <div className="checkmark">✓</div>
          </div>
          <h1 className="thankyou-title">Booking Confirmed!</h1>
          <p className="thankyou-subtitle">
            Thank you <span className="user-greeting">{orderDetails.userName}</span> for choosing Ironing Boy
          </p>
          <p className="thankyou-subtitle">
            Your card has been saved securely. Payment will be charged automatically after we send the invoice.
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>
            <i className="fas fa-receipt"></i>
            Booking Summary
          </h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-hashtag"></i>
                Booking ID
              </div>
              <div className="order-id-highlight">
                <i className="fas fa-barcode"></i>
                <code>{orderDetails.orderId}</code>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-calendar-check"></i>
                Booking Date
              </div>
              <p className="summary-value">{orderDetails.orderDate}</p>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-tag"></i>
                Status
              </div>
              <span className="status-badge">
                <i className="fas fa-check-circle"></i>
                {orderDetails.status}
              </span>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-truck-loading"></i>
                Pickup Time
              </div>
              <p className="summary-value">{orderDetails.pickupTime}</p>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-shipping-fast"></i>
                Estimated Delivery
              </div>
              <p className="summary-value">{orderDetails.estimatedDelivery}</p>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <i className="fas fa-credit-card"></i>
                Payment Status
              </div>
              <div className="payment-status-info">
                <span className="payment-status-badge">
                  <i className="fas fa-save"></i>
                  Card Saved
                </span>
                <p className="payment-status-note">
                  Will be charged after invoice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information Card */}
        <div className="payment-info-card">
          <div className="payment-info-header">
            <i className="fas fa-credit-card"></i>
            <h4>Payment Information</h4>
          </div>
          <div className="payment-info-content">
            <div className="payment-info-item">
              <span className="payment-info-label">
                <i className="fas fa-shield-alt"></i>
                Payment Method:
              </span>
              <span className="payment-info-value">
                {orderDetails.paymentMethod}
              </span>
            </div>
            <div className="payment-info-item">
              <span className="payment-info-label">
                <i className="fas fa-pound-sign"></i>
                Amount:
              </span>
              <span className="payment-info-value">
                {orderDetails.totalAmount}
              </span>
            </div>
            <div className="payment-info-item">
              <span className="payment-info-label">
                <i className="fas fa-info-circle"></i>
                Note:
              </span>
              <span className="payment-info-value">
                Your card will be charged automatically when we send the invoice.
                Minimum: £20 + £2 service fee.
              </span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="order-timeline">
          <h3>
            <i className="fas fa-map-signs"></i>
            What Happens Next?
          </h3>
          <div className="timeline-steps">
            <div className="timeline-step active">
              <div className="timeline-icon">
                <i className="fas fa-truck-loading"></i>
              </div>
              <div className="timeline-content">
                <h4>Driver Pickup</h4>
                <p>Our driver will arrive during your scheduled pickup window</p>
              </div>
            </div>

            <div className="timeline-step">
              <div className="timeline-icon">
                <i className="fas fa-spray-can"></i>
              </div>
              <div className="timeline-content">
                <h4>Laundry Processing</h4>
                <p>Your clothes will be professionally cleaned, pressed, and cared for</p>
              </div>
            </div>

            <div className="timeline-step">
              <div className="timeline-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="timeline-content">
                <h4>Delivery & Invoice</h4>
                <p>Fresh clothes delivered + invoice sent (auto-charge from saved card)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-grid">
          <button 
            className="action-btn btn-primary"
            onClick={handleBookAnother}
          >
            <i className="fas fa-plus-circle"></i>
            Book Another Service
          </button>
          
          <Link 
            to="/"
            className="action-btn btn-outline"
            onClick={handleGoHome}
          >
            <i className="fas fa-home"></i>
            Go to Homepage
          </Link>
        </div>

        {/* Support Section */}
        <div className="support-section">
          <h4>
            <i className="fas fa-question-circle"></i>
            Need Help?
          </h4>
          <div className="support-contacts">
            <a href="mailto:support@ironingboy.com" className="support-link">
              <i className="fas fa-envelope"></i>
              support@ironingboy.com
            </a>
            <a href="tel:+442031231010" className="support-link">
              <i className="fas fa-phone"></i>
              +44 20 3123 1010
            </a>
            <p style={{ fontSize: '14px', color: '#92400e', marginTop: '8px' }}>
              Our support team is available 7 AM - 7 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;