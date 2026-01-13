// src/components/FAQ.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // FAQ items data - Updated for laundry service
  const faqItems = [
    {
      id: 1,
      category: 'Booking & Scheduling',
      question: 'How do I schedule a laundry pickup?',
      answer: 'You can schedule a pickup through our website or mobile app by choosing a convenient time slot. We offer pickups seven days a week. In London, services are available Monday to Friday from 7 AM to 8 PM, Saturday from 8 AM to 7 PM, and Sunday from 11 AM to 5 PM. In Oxford, pickups are available Monday to Saturday from 1 PM to 9 PM. '
    },
    {
      id: 2,
      category: 'Booking & Scheduling',
      question: 'Can I schedule same-day service?',
      answer: 'Yes, we offer same-day service for orders placed before 11 AM. Just select the Delivery slot option same day during booking (available in select areas).'
    },
    {
      id: 3,
      category: 'Booking & Scheduling',
      question: 'What are your operating hours?',
      answer: 'We operate pickups 7 days a week. In London, services are available Monday to Friday from 7 AM to 8 PM, Saturday from 8 AM to 7 PM, and Sunday from 11 AM to 5 PM. In Oxford, pickups are available Monday to Saturday from 1 PM to 9 PM. Our processing facility operates 24/7.'
    },
    {
      id: 4,
      category: 'Pricing & Payment',
      question: 'What are your pricing options?',
      answer: 'We offer transparent pricing starting from £20 minimum order + £2 service charge. Each item has a fixed price - check our pricing page for detailed rates.'
    },
    {
      id: 5,
      category: 'Pricing & Payment',
      question: 'Do you have a minimum order amount?',
      answer: 'Yes, the minimum order amount is £20. This helps us provide quality service while keeping our operations sustainable.'
    },
    {
      id: 6,
      category: 'Pricing & Payment',
      question: 'How do I pay for the service?',
      answer: 'We accept credit/debit cards. Your card is saved securely with Stripe for automatic invoice payment.'
    },
    {
      id: 7,
      category: 'Services & Processing',
      question: 'What types of fabrics do you handle?',
      answer: 'We care for all kinds of fabrics including delicate silks, cotton, wool, linen, cashmere, and synthetic blends. Our experts use appropriate methods for each fabric type.'
    },
    {
      id: 8,
      category: 'Services & Processing',
      question: 'Do you offer dry cleaning services?',
      answer: 'Yes, we provide professional dry cleaning for delicate fabrics, suits, dresses, and special garments that require extra care.'
    },
    {
      id: 9,
      category: 'Services & Processing',
      question: 'How long does laundry service take?',
      answer: 'Standard service takes 24-48 hours. Express service (additional fee) delivers in 12 hours. Same-day service available for orders placed before 12 PM.'
    },
    {
      id: 10,
      category: 'Services & Processing',
      question: 'Do you use eco-friendly products?',
      answer: 'Absolutely! We use eco-friendly, non-toxic, biodegradable detergents that are safe for your clothes, skin, and the environment.'
    },
    {
      id: 11,
      category: 'Pickup & Delivery',
      question: 'Do you offer pickup and delivery?',
      answer: 'Yes, we offer FREE pickup and delivery at your doorstep. Just provide your address during booking and select a convenient time slot.'
    },
    {
      id: 12,
      category: 'Pickup & Delivery',
      question: 'What if I miss my pickup/delivery slot?',
      answer: 'No worries! You can reschedule via the app up to 2 hours before your scheduled time. Missed slots may incur a small rescheduling fee.'
    },
    {
      id: 13,
      category: 'Quality & Care',
      question: 'What if I have special instructions for my items?',
      answer: 'You can add special instructions during booking (e.g., "cold wash only", "no fabric softener", "extra starch"). Our team carefully follows all instructions.'
    },
    {
      id: 14,
      category: 'Quality & Care',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a 100% satisfaction guarantee. If you\'re not happy, contact us within 24 hours of delivery for a re-clean or full refund.'
    },
    {
      id: 15,
      category: 'Quality & Care',
      question: 'Do you offer ironing/folding services?',
      answer: 'Yes! All items are professionally cleaned, pressed/ironed, and neatly folded or hung based on your preference during booking.'
    },
    {
      id: 16,
      category: 'Business Policies',
      question: 'Are there any items you cannot clean?',
      answer: 'We cannot clean items with hazardous materials, mold, bodily fluids, extremely delicate antique fabrics, or items with sentimental value we cannot guarantee.'
    },
    {
      id: 17,
      category: 'Business Policies',
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 2 hours before pickup. Cancellations within 2 hours may incur a £5 fee. No charge if we haven\'t collected your items.'
    },
    {
      id: 18,
      category: 'Business Policies',
      question: 'Do you service my area?',
      answer: 'We serve most major cities in the UK. Enter your postcode on our homepage to check availability in your area.'
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate('/search', { state: { query: searchTerm.trim() } });
    }
  };

  const handleSearchButtonClick = () => {
    if (searchTerm.trim()) {
      navigate('/search', { state: { query: searchTerm.trim() } });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveIndex(null);
  };

  // Filter FAQ items based on search term
  const filteredFaqItems = searchTerm ? faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Get top 6 most relevant FAQs to show initially
  const topFAQs = faqItems.slice(0, 6);

  // Get categories for quick links
  const categories = [...new Set(faqItems.map(item => item.category))];

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <div className="faq-badge">
            <i className="fas fa-question-circle"></i>
            <span>Need Help?</span>
          </div>
          
          <h1 className="faq-title">
            Frequently Asked 
            <span className="highlight"> Questions</span>
          </h1>
          
          <p className="faq-subtitle">
            Find quick answers to common questions about our laundry service
          </p>
        </div>

        {/* Quick Stats */}
        {/* <div className="faq-stats">
          <div className="faq-stat-item">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">24-48h</div>
              <div className="stat-label">Turnaround</div>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="faq-stat-item">
            <div className="stat-icon">
              <i className="fas fa-pound-sign"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">£20</div>
              <div className="stat-label">Min Order</div>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="faq-stat-item">
            <div className="stat-icon">
              <i className="fas fa-home"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">Free</div>
              <div className="stat-label">Pickup & Delivery</div>
            </div>
          </div>
        </div> */}

        {/* Search Section */}
        <div className="faq-search-section">
          <div className="search-container">
            <div className="search-wrapper">
              {/* <i className="fas fa-search search-icon"></i> */}
              <input
                type="text"
                placeholder="What would you like to know? Search for pricing, delivery, scheduling..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                className="faq-search-input"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="clear-search-btn"
                  aria-label="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <button 
                onClick={handleSearchButtonClick}
                className="search-submit-btn"
                disabled={!searchTerm.trim()}
                aria-label="Search"
              >
                {/* <i className="fas fa-arrow-right"></i> */}
              </button>
            </div>
            
            {searchTerm && filteredFaqItems.length > 0 && (
              <div className="search-results-info">
                <p className="results-count">
                  Found {filteredFaqItems.length} result{filteredFaqItems.length !== 1 ? 's' : ''} for "<strong>{searchTerm}</strong>"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Search Categories */}
        <div className="quick-categories">
          <p className="categories-label">Quick categories:</p>
          <div className="categories-tags">
            {categories.map(category => (
              <button
                key={category}
                className="category-tag"
                onClick={() => setSearchTerm(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="faq-content">
          {searchTerm ? (
            filteredFaqItems.length > 0 ? (
              <div className="search-results">
                <h3 className="results-title">
                  Search Results ({filteredFaqItems.length})
                </h3>
                <div className="faq-items-list">
                  {filteredFaqItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}
                    >
                      <button 
                        className="faq-question" 
                        onClick={() => toggleFAQ(item.id)}
                      >
                        <div className="question-content">
                          <span className="question-text">{item.question}</span>
                          <span className="question-icon">
                            <i className={`fas fa-chevron-${activeIndex === item.id ? 'up' : 'down'}`}></i>
                          </span>
                        </div>
                        <div className="question-category">{item.category}</div>
                      </button>
                      
                      <div className={`faq-answer ${activeIndex === item.id ? 'show' : ''}`}>
                        <div className="answer-content">
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>No matching FAQs found</h3>
                <p>We couldn't find any FAQs matching "<strong>{searchTerm}</strong>"</p>
                
                <div className="search-suggestions">
                  <p>Try searching for:</p>
                  <div className="suggestion-tags">
                    {['pricing', 'delivery', 'scheduling', 'payment', 'dry cleaning'].map(term => (
                      <button 
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="suggestion-tag"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="initial-view">
              <div className="top-faqs-section">
                <h3 className="section-title">Most Common Questions</h3>
                <div className="faq-items-list">
                  {topFAQs.map(item => (
                    <div 
                      key={item.id} 
                      className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}
                    >
                      <button 
                        className="faq-question" 
                        onClick={() => toggleFAQ(item.id)}
                      >
                        <div className="question-content">
                          <span className="question-text">{item.question}</span>
                          <span className="question-icon">
                            <i className={`fas fa-chevron-${activeIndex === item.id ? 'up' : 'down'}`}></i>
                          </span>
                        </div>
                        <div className="question-category">{item.category}</div>
                      </button>
                      
                      <div className={`faq-answer ${activeIndex === item.id ? 'show' : ''}`}>
                        <div className="answer-content">
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="faq-cta">
                <div className="cta-content">
                  <h3>Still have questions?</h3>
                  <p>Can't find what you're looking for? Our support team is here to help</p>
                  
                  <div className="cta-buttons">
                    <button 
                      className="primary-cta-btn"
                      onClick={() => navigate('/contact')}
                    >
                      <i className="fas fa-headset"></i>
                      Contact Support
                    </button>
                    
                    <button 
                      className="secondary-cta-btn"
                      onClick={() => navigate('/quick-booking')}
                    >
                      <i className="fas fa-calendar-check"></i>
                      Book a Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Only show this when searching */}
        {searchTerm && filteredFaqItems.length > 0 && (
          <div className="back-to-all">
            <button 
              onClick={clearSearch}
              className="back-to-all-btn"
            >
              <i className="fas fa-arrow-left"></i>
              Back to All FAQs
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;