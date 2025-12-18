// src/components/ThankYouPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: '',
    userName: '',
    userEmail: '',
    orderDate: '',
    totalAmount: '£0.00 (Will be charged after invoice)',
    paymentMethod: 'Card saved for auto-payment',
    serviceType: 'Express Laundry',
    paymentStatus: 'card_saved',
    bookingType: 'Quick Booking'
  });

  const [error, setError] = useState(null);
  const [confetti, setConfetti] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Parse time range to display format
  const parseTimeRange = useCallback((timeRange) => {
    if (!timeRange) return '';
    
    // Check if it's already in a readable format
    if (timeRange.includes(',')) {
      return timeRange;
    }
    
    // Try to parse 24-hour format like "13:00-14:00"
    if (timeRange.includes('-')) {
      const [start, end] = timeRange.split('-');
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
      };
      return `${formatTime(start)} - ${formatTime(end)}`;
    }
    
    return timeRange;
  }, []);

  // Format date to readable format
  const formatDateReadable = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      
      // Handle YYYY-MM-DD format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }, []);

  // Format order date and time
  const formatOrderDateTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Copy order ID to clipboard
  const copyOrderId = useCallback(() => {
    navigator.clipboard.writeText(orderDetails.orderId)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  }, [orderDetails.orderId]);

  // Close modal and navigate
  const closeModal = useCallback((path = '/') => {
    setShowModal(false);
    setTimeout(() => navigate(path), 300);
  }, [navigate]);

  // Create confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const colors = ['#667eea', '#764ba2', '#10b981'];
      const container = document.querySelector('.confetti-container');
      if (!container) return;

      container.innerHTML = '';

      for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.width = `${Math.random() * 8 + 4}px`;
        confetti.style.height = confetti.style.width;
        confetti.style.opacity = Math.random() * 0.6 + 0.4;
        container.appendChild(confetti);
      }
    };

    if (confetti && showModal) {
      createConfetti();
      const timer = setTimeout(() => setConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [confetti, showModal]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        let orderData = {};
        
        // Check location state first (from QuickBooking navigation)
        if (location.state) {
          orderData = {
            ...location.state
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('lastQuickBookingOrder', JSON.stringify(orderData));
        } else {
          // Try to get order from localStorage
          const savedOrder = localStorage.getItem('lastQuickBookingOrder');
          if (savedOrder) {
            try {
              orderData = JSON.parse(savedOrder);
            } catch (e) {
              console.error('Error parsing localStorage order:', e);
            }
          }
        }

        // Get user profile if available
        const token = localStorage.getItem('jwtToken');
        let userName = 'Valued Customer';
        let userEmail = '';
        
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
              userName = profileData.name || user?.name || 'Valued Customer';
              userEmail = profileData.email || user?.email || '';
            }
          } catch (apiError) {
            console.error('API Error fetching profile:', apiError);
          }
        }

        // Process order details
        const pickupTime = parseTimeRange(orderData.pickupTime || '');
        const deliveryTime = parseTimeRange(orderData.deliveryTime || '');
        const pickupDate = orderData.pickupDate ? formatDateReadable(orderData.pickupDate) : '';
        const deliveryDate = orderData.deliveryDate ? formatDateReadable(orderData.deliveryDate) : '';
        
        // Determine payment method display
        let paymentMethod = 'Card saved for auto-payment';
        if (orderData.paymentMethod === 'saved_card') {
          paymentMethod = 'Saved Card (Auto-payment)';
        } else if (orderData.paymentMethod === 'new_card') {
          paymentMethod = 'New Card (Auto-payment)';
        }

        setOrderDetails({
          orderId: orderData.orderId || `IB-${Date.now().toString().slice(-8)}`,
          status: orderData.status || 'Confirmed',
          pickupDate: pickupDate,
          pickupTime: pickupTime,
          deliveryDate: deliveryDate,
          deliveryTime: deliveryTime,
          userName: userName,
          userEmail: userEmail,
          orderDate: formatOrderDateTime(),
          totalAmount: '£20.00 minimum + £2.00 service fee',
          paymentMethod: paymentMethod,
          paymentStatus: orderData.paymentStatus || 'card_saved',
          serviceType: 'Express Laundry Service',
          bookingType: 'Quick Booking'
        });

      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Unable to load order details. Please check your internet connection and try again.');
        
        // Fallback to basic data
        setOrderDetails(prev => ({
          ...prev,
          orderId: `IB-${Date.now().toString().slice(-8)}`,
          userName: user?.name || 'Valued Customer',
          orderDate: formatOrderDateTime()
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, location.state, parseTimeRange, formatDateReadable, formatOrderDateTime]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [showModal, closeModal]);

  if (!showModal) {
    return null;
  }

  if (loading) {
    return (
      <div className="thankyou-modal-overlay">
        <div className="thankyou-modal loading">
          <div className="modal-loading-content">
            <div className="loading-animation">
              <div className="loading-circle"></div>
              <div className="loading-circle"></div>
              <div className="loading-circle"></div>
            </div>
            <h2>Processing Your Order</h2>
            <p>Please wait while we confirm your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="thankyou-modal-overlay">
        <div className="thankyou-modal error">
          <div className="modal-error-content">
            <div className="error-animation">
              <div className="error-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <h2>Something Went Wrong</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="modal-action-btn primary"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo"></i>
                Try Again
              </button>
              <button 
                className="modal-action-btn outline"
                onClick={() => closeModal('/')}
              >
                <i className="fas fa-home"></i>
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thankyou-modal-overlay">
      {confetti && <div className="confetti-container"></div>}
      
      <div className={`thankyou-modal ${showModal ? 'show' : ''}`}>
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={() => closeModal('/')}
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Success Icon */}
        <div className="success-icon-container">
          <div className="success-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h1 className="modal-title">Booking Confirmed!</h1>
          </div>

          {/* Booking Details */}
          <div className="booking-details-section">
            <div className="booking-id-container">
              <div className="booking-id-label">BOOKING ID</div>
              <div className="booking-id-value">{orderDetails.orderId}</div>
              <button 
                className={`copy-order-id ${copySuccess ? 'success' : ''}`}
                onClick={copyOrderId}
                title="Copy to clipboard"
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
              </button>
            </div>
            
            <div className="status-container">
              <div className={`status-badge ${orderDetails.status.toLowerCase()}`}>
                {orderDetails.status}
              </div>
              <div className="booking-date-info">
                <i className="far fa-calendar-alt"></i>
                {orderDetails.orderDate}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* Schedule Section */}
          <div className="schedule-section">
            <h2 className="section-title">Your Schedule</h2>
            
            <div className="schedule-cards">
              {/* Pickup Card */}
              <div className="schedule-card pickup">
                <div className="schedule-card-content">
                  <div className="schedule-icon">
                    <i className="fas fa-truck-pickup"></i>
                  </div>
                  <div className="schedule-details">
                    <h3>Pickup</h3>
                    {orderDetails.pickupDate && orderDetails.pickupTime ? (
                      <>
                        <div className="schedule-time">{orderDetails.pickupTime}</div>
                        <div className="schedule-date">{orderDetails.pickupDate}</div>
                      </>
                    ) : (
                      <div className="schedule-pending">
                        <i className="fas fa-clock"></i>
                        <span>Time will be confirmed shortly</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Card */}
              <div className="schedule-card delivery">
                <div className="schedule-card-content">
                  <div className="schedule-icon">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="schedule-details">
                    <h3>Delivery</h3>
                    {orderDetails.deliveryDate && orderDetails.deliveryTime ? (
                      <>
                        <div className="schedule-time">{orderDetails.deliveryTime}</div>
                        <div className="schedule-date">{orderDetails.deliveryDate}</div>
                      </>
                    ) : (
                      <div className="schedule-pending">
                        <i className="fas fa-clock"></i>
                        <span>Time will be confirmed shortly</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-section">
            <button 
              className="action-btn primary-btn"
              onClick={() => closeModal('/quick-booking')}
            >
              <i className="fas fa-plus"></i>
              BOOK ANOTHER
            </button>
            
            <button 
              className="action-btn secondary-btn"
              onClick={() => closeModal('/orders')}
            >
              <i className="fas fa-history"></i>
              VIEW ORDERS
            </button>
            
            <button 
              className="action-btn outline-btn"
              onClick={() => closeModal('/')}
            >
              <i className="fas fa-home"></i>
              GO HOME
            </button>
          </div>

          {/* Divider */}
          <div className="divider light"></div>

          {/* Help Section */}
          <div className="help-section">
            <h3 className="help-title">
              <i className="fas fa-question-circle"></i>
              Need Help?
            </h3>
            
            <div className="contact-options">
              <a href="mailto:support@ironingboy.com" className="contact-option">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-label">EMAIL SUPPORT</div>
                  <div className="contact-value">support@ironingboy.com</div>
                </div>
              </a>
              
              <a href="tel:+442031231010" className="contact-option">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-label">CALL US</div>
                  <div className="contact-value">+44 20 3123 1010</div>
                </div>
              </a>
              
              <a href="https://wa.me/442031231010" className="contact-option whatsapp" target="_blank" rel="noopener noreferrer">
                <div className="contact-icon">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div className="contact-info">
                  <div className="contact-label">WHATSAPP</div>
                  <div className="contact-value">Chat Now</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;