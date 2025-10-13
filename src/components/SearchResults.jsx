// src/components/SearchResults.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const searchQuery = location.state?.query || '';

  // Mock search results - you can replace this with actual search logic
  const searchResults = [
    {
      id: 1,
      title: 'Pricing Information',
      description: 'Detailed pricing for all our services',
      link: '/pricing',
      category: 'Pricing'
    },
    {
      id: 2,
      title: 'Service Types',
      description: 'Learn about our different service options',
      link: '/services',
      category: 'Services'
    },
    {
      id: 3,
      title: 'How It Works',
      description: 'Step-by-step guide to using our service',
      link: '/how-it-works',
      category: 'Process'
    }
  ];

  return (
    <div className="search-results-page">
      <div className="back-button-container">
        <Link to="/faq" className="back-button">
          ← Back to FAQ
        </Link>
      </div>

      <div className="search-results-container">
        <h1>Search Results</h1>
        <p className="search-query">Showing results for: "{searchQuery}"</p>
        
        {searchResults.length > 0 ? (
          <div className="results-grid">
            {searchResults.map(result => (
              <Link key={result.id} to={result.link} className="result-card">
                <div className="result-category">{result.category}</div>
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <span className="result-link">Learn more →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No results found</h3>
            <p>Try searching with different keywords or browse our FAQ section.</p>
            <Link to="/faq" className="cta-button">Back to FAQ</Link>
          </div>
        )}

        <div className="search-tips">
          <h4>Search Tips:</h4>
          <ul>
            <li>Try using different keywords</li>
            <li>Check the spelling of your search terms</li>
            <li>Browse our FAQ section for common questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;