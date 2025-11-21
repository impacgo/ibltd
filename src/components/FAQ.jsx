// src/components/FAQ.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // FAQ items data
  const faqItems = [
    {
      question: 'How do I schedule a laundry pickup?',
      answer: 'You can schedule a pickup via our website or mobile app by selecting a convenient time slot. We offer pickups 7 days a week.'
    },
    {
      question: 'What types of fabrics do you handle?',
      answer: 'We care for all kinds of fabrics including delicate silks, cotton, wool, and synthetic blends. Our experts know exactly how to treat each fabric type.'
    },
    {
      question: 'How long does laundry service take?',
      answer: 'Typically, laundry is processed and delivered within 24-48 hours after pickup. We also offer express services for an additional fee.'
    },
    {
      question: 'Do you use eco-friendly products?',
      answer: 'Yes! We use eco-friendly, non-toxic detergents that are safe for you, your clothes, and the environment.'
    },
    {
      question: 'What are your pricing options?',
      answer: 'We offer competitive pricing for all services. Check our pricing page for detailed information on rates for different items and services.'
    },
    {
      question: 'Do you offer dry cleaning services?',
      answer: 'Yes, we provide professional dry cleaning for delicate fabrics and special garments that require extra care.'
    },
    {
      question: 'How do I pay for the service?',
      answer: 'We accept various payment methods including credit cards, debit cards, and digital wallets. Payment is processed after service completion.'
    },
    {
      question: 'What if I have special instructions for my items?',
      answer: 'You can add special instructions during the booking process, and our team will carefully follow them.'
    },
    {
      question: 'Do you offer pickup and delivery?',
      answer: 'Yes, we offer convenient pickup and delivery services for your convenience.'
    },
    {
      question: 'What are your operating hours?',
      answer: 'We operate from 8:00 AM to 8:00 PM, 7 days a week.'
    },
    {
      question: 'Do you handle emergency requests?',
      answer: 'Yes, we offer express services for urgent requests with faster turnaround times.'
    },
    {
      question: 'Are there any items you cannot clean?',
      answer: 'We do not clean items with hazardous materials or extremely delicate antique fabrics.'
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
  const filteredFaqItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="faq-header-block">
  <h2 className="section-title">Frequently Asked Questions</h2>
</div>

        
        {/* Search Bar */}
        <div className="faq-search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search FAQs... (e.g., pricing, delivery, fabrics)"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchSubmit}
              className="faq-search-input"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="clear-search-button"
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
            <button 
              onClick={handleSearchButtonClick}
              className="search-button"
              disabled={!searchTerm.trim()}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {searchTerm && (
            <div className="search-info">
              <p className="search-results-count">
                Found {filteredFaqItems.length} results for "<strong>{searchTerm}</strong>"
              </p>
              <button 
                onClick={clearSearch}
                className="view-all-button"
              >
                View All FAQs
              </button>
            </div>
          )}
        </div>

        {/* FAQ List - Only show when searching */}
        <div className="faq-list">
          {searchTerm ? (
            filteredFaqItems.length > 0 ? (
              filteredFaqItems.map((item, index) => (
                <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFAQ(index)}>
                    <span className="question-text">{item.question}</span>
                    <span className="faq-icon">{activeIndex === index ? '−' : '+'}</span>
                  </button>
                  <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>We couldn't find any FAQs matching "<strong>{searchTerm}</strong>"</p>
                <div className="suggestions">
                  <p>Try searching for:</p>
                  <ul>
                    <li>pricing</li>
                    <li>delivery</li>
                    <li>fabrics</li>
                    <li>payment</li>
                    <li>schedule</li>
                  </ul>
                </div>
                <button 
                  onClick={clearSearch}
                  className="cta-button"
                >
                  View All FAQs
                </button>
              </div>
            )
          ) : (
            <div className="search-prompt">
              <div className="prompt-icon">💡</div>
              <h3>Search Our FAQs</h3>
              <p>Type in the search bar above to find answers to your questions</p>
              <div className="popular-searches">
                <p>Popular searches:</p>
                <div className="search-tags">
                  <button onClick={() => setSearchTerm('pricing')}>pricing</button>
                  <button onClick={() => setSearchTerm('delivery')}>delivery</button>
                  <button onClick={() => setSearchTerm('payment')}>payment</button>
                  <button onClick={() => setSearchTerm('schedule')}>schedule</button>
                  <button onClick={() => setSearchTerm('fabrics')}>fabrics</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQ;