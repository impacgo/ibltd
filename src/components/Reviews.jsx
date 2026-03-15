import React from 'react';
import ReviewabilityAdvancedWidget from './ReviewabilityAdvancedWidget';
import './Reviews.css';

const Reviews = () => {
  return (
    <section className="reviews-page">
      <div className="reviews-shell">
        <div className="reviews-header">
          <div className="reviews-badge">
            <i className="fas fa-star"></i>
            <span>Verified Reviews</span>
          </div>
          <h1 className="reviews-title">Customer Reviews</h1>
          <p className="reviews-subtitle">
            Read verified customer feedback from across the UK.
          </p>
        </div>

        <div className="reviews-widget-panel">
          <div className="reviews-widget-frame">
            <ReviewabilityAdvancedWidget
              className="reviews-widget"
              bid="164019"
              url="https://app.revu.cloud"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
