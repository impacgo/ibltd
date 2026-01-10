// src/pages/Reviews.jsx
import React from 'react';
import ReviewsPageWidget from '../components/ReviewsPageWidget';
import SubmitReviewForm from '../components/SubmitReviewForm';
import './Reviews.css';
import { useNavigate } from 'react-router-dom';


const Reviews = () => {
    const navigate = useNavigate();
  return (
    <div className="reviews-page">
     <button
  className="reviews-back-btn"
  onClick={() => navigate(-1)}
  aria-label="Go back"
>
  <i className="fas fa-arrow-left"></i>
  <span>Back</span>
</button>
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <div className="section-badge">
            <i className="fas fa-star"></i>
            <span>Verified Reviews</span>
          </div>
          <h1 className="reviews-title">
            Customer Reviews
          </h1>
          <p className="reviews-subtitle">
            Real feedback from real customers who trust Ironing Boy for their laundry needs
          </p>
        </div>
        
        {/* Trust Metrics
        <div className="trust-metrics">
          <div className="metric-card">
            <div className="metric-value">4.8★</div>
            <div className="metric-label">Average Rating</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">2,500+</div>
            <div className="metric-label">Reviews</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">98%</div>
            <div className="metric-label">Satisfaction</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">24h</div>
            <div className="metric-label">Response Time</div>
          </div>
        </div> */}
        
        {/* Main Content - Two Columns on Desktop */}
        
            <SubmitReviewForm />
          
          
          {/* Reviews Widget */}
          {/* <div className="reviews-widget-section">
            <div className="section-header">
              <h2>What Our Customers Say</h2>
              <p>Verified reviews from thousands of satisfied customers across the UK</p>
            </div>
            <div className="reviews-widget-container">
              <ReviewsPageWidget />
            </div>
          </div> */}
        
        
        {/* Review Guidelines */}
        <div className="review-guidelines">
          <div className="guidelines-header">
            <i className="fas fa-info-circle"></i>
            <h3>Review Guidelines</h3>
          </div>
          <div className="guidelines-list">
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <h4>Be Authentic</h4>
              <p>Share your genuine experience with our laundry services</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-star"></i>
              </div>
              <h4>Focus on Service</h4>
              <p>Rate based on quality, delivery time, and customer service</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Keep it Clean</h4>
              <p>Avoid personal information or inappropriate content</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4>Verified Reviews</h4>
              <p>All reviews are verified to ensure authenticity</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="reviews-cta">
          <h3>Questions About Our Services?</h3>
          <p>Contact our customer support team for any questions or concerns</p>
          <div className="cta-buttons">
            <button 
              className="cta-button"
              onClick={() => window.location.href = '/contact'}
            >
              <i className="fas fa-headset"></i> Contact Support
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => window.location.href = '/faq'}
            >
              <i className="fas fa-question-circle"></i> Visit FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;