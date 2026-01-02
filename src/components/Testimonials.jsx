// src/components/Testimonials.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Olivia Bennett',
    location: 'London',
    title: 'Exceptional Stain Removal Service',
    text: 'Had an important business suit with stubborn coffee stains that needed immediate attention. The team collected it promptly and returned it spotless the very next day. The drivers were courteous and professional throughout. Highly recommended for last-minute emergencies!',
    rating: 5,
    service: 'Dry Cleaning',
  },
  {
    name: 'James Harrington',
    location: 'Manchester',
    title: 'Lifesaver for Our Busy Household',
    text: 'With three children and both parents working full-time, laundry was becoming overwhelming. Since discovering this service, we\'ve reclaimed our weekends. The consistent quality and reliable scheduling have made this an indispensable part of our family routine.',
    rating: 5,
    service: 'Wash & Fold',
  },
  {
    name: 'Charlotte Sinclair',
    location: 'Edinburgh',
    title: 'Professional Service for Busy Executives',
    text: 'As a consultant with frequent travel, maintaining professional attire is essential. This service has transformed my work-life balance. The attention to detail, especially with delicate fabrics, is remarkable. It feels like having a personal valet service.',
    rating: 5,
    service: 'Premium Ironing',
  },
  {
    name: 'William Cartwright',
    location: 'Birmingham',
    title: 'Reliable and Efficient Weekly Service',
    text: 'We\'ve been using the weekly subscription for six months now. The consistency in quality and punctuality is impressive. Clothes return perfectly pressed and organised. It\'s become a non-negotiable part of our household management.',
    rating: 5,
    service: 'Subscription',
  },
  {
    name: 'Eleanor Prescott',
    location: 'Bristol',
    title: 'Outstanding Wedding Attire Care',
    text: 'For my wedding, I needed multiple delicate garments cleaned and pressed. The team handled everything with exceptional care, ensuring everything was flawless for the big day. Their specialised fabric knowledge gave me complete peace of mind.',
    rating: 5,
    service: 'Special Garments',
  },
  {
    name: 'Thomas Aldridge',
    location: 'Leeds',
    title: 'Perfect for Student Accommodation',
    text: 'As a university student without laundry facilities, this service has been invaluable. Affordable, reliable, and saves hours each week. The fold-and-pack service means my limited storage space stays organised. Essential student service!',
    rating: 5,
    service: 'Student Package',
  },
  {
    name: 'Sophie Wentworth',
    location: 'Glasgow',
    title: 'Corporate Uniform Solution',
    text: 'Our small business needed a reliable laundry service for staff uniforms. The corporate package has streamlined our operations completely. Consistent quality and flexible scheduling have eliminated all our previous laundry headaches.',
    rating: 5,
    service: 'Corporate Service',
  },
  {
    name: 'Benjamin Fletcher',
    location: 'Liverpool',
    title: 'Eco-Friendly Choice We Love',
    text: 'Appreciate the commitment to environmentally friendly practices. The biodegradable packaging and plant-based detergents align with our values, while the service quality remains exceptional. Truly a service that cares about more than just clean clothes.',
    rating: 4,
    service: 'Eco Service',
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const totalTestimonials = testimonials.length;
  const containerRef = useRef(null);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    
    setTouchStartX(0);
    setTouchEndX(0);
  };

  // Reset animation state after transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (!isAutoPlaying || isAnimating) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, isAnimating]);

  return (
    <section 
      className="testimonials-section"
      id="testimonials"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="testimonials-container">
        {/* Header */}
        <div className="testimonials-header">
          <div className="section-badge">
            <i className="fas fa-star"></i>
            <span>Customer Stories</span>
          </div>
          <h1 className="testimonials-title">
            Trusted by 
            <span className="highlight"> Thousands</span>
          </h1>
          <p className="testimonials-subtitle">
            Don't just take our word for it - hear from our satisfied customers across the UK
          </p>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="mobile-progress">
          <span className="current-slide">{currentIndex + 1}</span>
          <span className="progress-divider">/</span>
          <span className="total-slides">{totalTestimonials}</span>
        </div>

        {/* Testimonial Cards Container */}
        <div 
          className="testimonials-wrapper"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="testimonials-track">
            {testimonials.map((testimonial, index) => (
              <div 
                className={`testimonial-card ${
                  index === currentIndex ? 'active' : 
                  index === (currentIndex - 1 + totalTestimonials) % totalTestimonials ? 'prev' :
                  index === (currentIndex + 1) % totalTestimonials ? 'next' : 'hidden'
                }`}
                key={index}
                aria-hidden={index !== currentIndex}
              >
                <div className="card-content">
                  {/* Service Tag */}
                  <div className="service-tag">
                    <i className="fas fa-tag"></i>
                    <span>{testimonial.service}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < testimonial.rating ? 'filled' : ''}`}
                      >
                        <i className="fas fa-star"></i>
                      </span>
                    ))}
                    <span className="rating-number">{testimonial.rating}.0</span>
                  </div>

                  {/* Testimonial Title */}
                  <h3 className="testimonial-title">{testimonial.title}</h3>

                  {/* Testimonial Text */}
                  <div className="testimonial-text-wrapper">
                    <div className="quote-icon">
                      <i className="fas fa-quote-left"></i>
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                  </div>

                  {/* Customer Info */}
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="customer-details">
                      <div className="customer-name-location">
                        <span className="customer-name">{testimonial.name}</span>
                        <span className="customer-location">
                          <i className="fas fa-map-marker-alt"></i>
                          {testimonial.location}
                        </span>
                      </div>
                      <div className="verified-customer">
                        <i className="fas fa-check-circle"></i>
                        Verified Customer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            className="nav-arrow prev" 
            onClick={handlePrev} 
            disabled={isAnimating}
            aria-label="Previous testimonial"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            className="nav-arrow next" 
            onClick={handleNext} 
            disabled={isAnimating}
            aria-label="Next testimonial"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="pagination-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''} ${isAnimating ? 'disabled' : ''}`}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile Navigation Buttons */}
        {/* <div className="mobile-nav-buttons">
          <button 
            className="mobile-nav-btn prev"
            onClick={handlePrev}
            disabled={isAnimating}
            aria-label="Previous testimonial"
          >
            <i className="fas fa-chevron-left"></i>
            <span>Previous</span>
          </button>
          <button 
            className="mobile-nav-btn next"
            onClick={handleNext}
            disabled={isAnimating}
            aria-label="Next testimonial"
          >
            <span>Next</span>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div> */}

        {/* Auto-play Indicator - Hide on mobile */}
        <div className="autoplay-indicator desktop-only">
          <div className="autoplay-status">
            <span className={`autoplay-dot ${isAutoPlaying ? 'playing' : 'paused'}`}></span>
            <span className="autoplay-text">
              {isAutoPlaying ? 'Auto-playing' : 'Hover to pause'}
            </span>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="mobile-swipe-hint">
          <i className="fas fa-arrows-left-right"></i>
          <span>Swipe left or right to navigate</span>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;