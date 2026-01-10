// src/components/SubmitReviewForm.jsx
import React, { useState } from 'react';
import './SubmitReviewForm.css';

const SubmitReviewForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    review: '',
    service: '',
    isSubmitting: false
  });

  const services = [
    'Laundry',
    'Dry Cleaning',
    'Ironing/Pressing',
    'Service Wash',
    'Repair & Alteration',
    'Shoe Cleaning'
  ];

  const ratingEmojis = {
    1: { emoji: '😡', text: 'Terrible', color: '#ef4444' },
    2: { emoji: '😞', text: 'Poor', color: '#f97316' },
    3: { emoji: '😐', text: 'Average', color: '#eab308' },
    4: { emoji: '😊', text: 'Good', color: '#22c55e' },
    5: { emoji: '😍', text: 'Excellent', color: '#10b981' }
  };

  const getCurrentRating = () => {
    return ratingEmojis[formData.rating] || { emoji: '😶', text: 'Select Rating', color: '#6b7280' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({ ...formData, isSubmitting: true });
    
    setTimeout(() => {
      alert('Thank you for your review! You will be redirected to our secure review platform.');
      // Redirect to RevU review page
      window.open('https://ironingboy.revu.cloud/review', '_blank');
      setFormData({
        name: '',
        email: '',
        rating: 0,
        review: '',
        service: '',
        isSubmitting: false
      });
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRating = (rating) => {
    setFormData({ ...formData, rating });
  };

  const openGoogleReviews = () => {
    // Use Google Maps search for your business
    window.open('https://www.google.com/maps/search/Ironing+Boy+laundry+services', '_blank');
  };

  const openFacebookReviews = () => {
    window.open('https://www.facebook.com/ironingboyy/reviews', '_blank');
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h2>Share Your Experience</h2>
        <p>Your honest feedback helps us improve and helps others make informed decisions</p>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="name">Your Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
          <small className="email-note">We'll only use this to verify your review</small>
        </div>

        <div className="form-group">
          <label>Service Used *</label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="service-select"
          >
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service}>{service}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Your Rating *</label>
          <div className="rating-section">
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                  onClick={() => handleRating(star)}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <i className={`fas fa-star ${star <= formData.rating ? 'fas' : 'far'}`}></i>
                </button>
              ))}
            </div>
            
            {/* Emoji Feedback */}
            <div className="rating-feedback">
              <div className={`emoji-container ${formData.rating > 0 ? 'visible' : ''}`}>
                <span 
                  className="emoji" 
                  role="img" 
                  aria-label={getCurrentRating().text}
                  style={{ color: getCurrentRating().color }}
                >
                  {getCurrentRating().emoji}
                </span>
                <span className="rating-text" style={{ color: getCurrentRating().color }}>
                  {getCurrentRating().text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="review">Your Review *</label>
          <textarea
            id="review"
            name="review"
            value={formData.review}
            onChange={handleChange}
            placeholder="Tell us about your experience with our laundry service..."
            rows="4"
            required
            minLength="20"
          ></textarea>
          <small className="char-count">
            {formData.review.length}/100 characters (minimum 20)
          </small>
        </div>

        <div className="form-footer">
          <p className="privacy-note">
            <i className="fas fa-lock"></i> Your review will be posted on our verified review platform (RevU)
          </p>
          <button 
            type="submit" 
            className="submit-review-btn"
            disabled={formData.isSubmitting || formData.rating === 0 || formData.review.length < 20}
          >
            {formData.isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Submit Review
              </>
            )}
          </button>
        </div>
      </form>

      {/* <div className="alternative-option">
        <p>Prefer to review on Google or Facebook?</p>
        <div className="external-review-links">
          <button 
            onClick={openGoogleReviews}
            className="external-review-btn google"
          >
            <i className="fab fa-google"></i> Google Reviews
          </button>
          <button 
            onClick={openFacebookReviews}
            className="external-review-btn facebook"
          >
            <i className="fab fa-facebook"></i> Facebook Reviews
          </button>
        </div>
        <p className="external-note">
          These links will open in a new tab to our business profiles
        </p>
      </div> */}
    </div>
  );
};

export default SubmitReviewForm;