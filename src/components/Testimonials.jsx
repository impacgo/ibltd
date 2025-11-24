// src/components/Testimonials.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Diana Wrangham',
    title: 'All stains gone, good as new',
    text: 'Needed a suit and shirt dry cleaned a day before a wedding. Promptly picked up and delivered the next day. Great service with lovely, friendly drivers. Definitely worth 5 stars!',
    rating: 5,
  },
  {
    name: 'Ken Woodberry',
    title: 'A god-send to our busy family',
    text: 'We have 5 kids and two busy jobs, so we were just drowning in laundry. After our very first order with IHI, we\'ve never looked back. A fantastic operation!',
    rating: 5,
  },
  {
    name: 'Manisha Tata',
    title: 'The ultimate self-care',
    text: 'This service is revolutionary for the busy professional who just needs a helping hand. Feels like my mum coming round to help when everything else feels too much. It\'s genius.',
    rating: 5,
  },
  {
    name: 'John Smith',
    title: 'Reliable and quick!',
    text: 'Super impressed with the turnaround time and the quality. Clothes came back perfectly folded.',
    rating: 5,
  },
  {
    name: 'Amelia Brown',
    title: 'Great experience!',
    text: 'The pickup and delivery were smooth, and everything smelled amazing. Will definitely use again!',
    rating: 5,
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const totalTestimonials = testimonials.length;
  const sliderRef = useRef();

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
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="testimonials-container">
        {/* Header */}
        <div className="testimonials-header">
          <div className="section-badge">Testimonials</div>
          <h2>What Our Customers Say</h2>
          <p>Don't just take our word for it - hear from our satisfied customers</p>
        </div>

        {/* Testimonial Cards Container */}
        <div className="testimonials-wrapper">
          <div className="testimonials-track">
            {testimonials.map((testimonial, index) => (
              <div 
                className={`testimonial-card ${
                  index === currentIndex ? 'active' : 
                  index === (currentIndex - 1 + totalTestimonials) % totalTestimonials ? 'prev' :
                  index === (currentIndex + 1) % totalTestimonials ? 'next' : 'hidden'
                }`}
                key={index}
              >
                <div className="card-content">
                  {/* Rating Stars */}
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < testimonial.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Testimonial Title */}
                  <h3 className="testimonial-title">{testimonial.title}</h3>

                  {/* Testimonial Text */}
                  <p className="testimonial-text">"{testimonial.text}"</p>

                  {/* Customer Info */}
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="customer-details">
                      <div className="customer-name">{testimonial.name}</div>
                      <div className="verified-customer">Verified Customer</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button className="nav-arrow prev" onClick={handlePrev} disabled={isAnimating}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="nav-arrow next" onClick={handleNext} disabled={isAnimating}>
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
      </div>
    </section>
  );
};

export default Testimonials;