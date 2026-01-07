import React, { useEffect, useState } from "react";
import "./totalpricing.css";
import { useNavigate } from "react-router-dom";


const API_BASE = "https://api.ironingboy.com";

// Format service name function (keeping your existing)
const formatServiceName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  const laundryTerms = {
    'dry clean': 'Dry Clean',
    'wash & press': 'Wash & Press',
    'press only': 'Press Only',
    'wash & presence': 'Wash & Presence',
    'child\'s': 'Child\'s',
    'men\'s': 'Men\'s',
    'women\'s': 'Women\'s',
    'kids\'': 'Kids\'',
    'baby\'s': 'Baby\'s',
    'silk': 'Silk',
    'wool': 'Wool',
    'linen': 'Linen',
    'cotton': 'Cotton',
    'polyester': 'Polyester',
    'folded': 'Folded',
    'hang': 'Hang',
    'iron': 'Iron',
    'steam': 'Steam',
    'starch': 'Starch',
  };
  
  let formatted = name.toLowerCase();
  
  Object.entries(laundryTerms).forEach(([lower, proper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    formatted = formatted.replace(regex, proper);
  });
  
  formatted = formatted
    .split(' ')
    .map(word => {
      if (Object.values(laundryTerms).includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  return formatted.replace(/\s+/g, ' ').trim();
};

const TotalPricing = () => {
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();
  const toServiceSlug = (categoryName) => {
  if (!categoryName) return "";

  return categoryName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};


  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await fetch(`${API_BASE}/categories`);
        const catJson = await catRes.json();
        const catList = catJson.data || [];
        const tempCatMap = {};
        const categoryNames = [];

        catList.forEach((c) => {
          tempCatMap[c.id] = c.name;
          categoryNames.push(formatServiceName(c.name));
        });

        // Fetch products
        const prodRes = await fetch(`${API_BASE}/products1`);
        const prodJson = await prodRes.json();
        const prodList = Array.isArray(prodJson)
          ? prodJson
          : prodJson.data || [];

        // Build grouped category → products list
        const grouped = {};
        categoryNames.forEach((cat) => (grouped[cat] = []));

        prodList.forEach((p) => {
          const categoryName = tempCatMap[p.category_id];
          if (!categoryName) return;

          const priceValue = p.price ?? p.standard_price ?? 0;
          const formattedCategory = formatServiceName(categoryName);
          const formattedName = formatServiceName(p.name);

          grouped[formattedCategory].push({
            name: formattedName,
            price: "£" + Number(priceValue).toFixed(2),
            priceNumber: parseFloat(priceValue)
          });
        });

        // Sort categories alphabetically
        const sortedCategories = [...categoryNames].sort();
        setCategories(sortedCategories);
        setCategoryMap(grouped);

      } catch (err) {
        console.error("Pricing Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    const lowerSearch = searchTerm.toLowerCase();
    const categoryMatches = category.toLowerCase().includes(lowerSearch);
    
    if (!categoryMatches && categoryMap[category]) {
      const serviceMatches = categoryMap[category].some(service => 
        service.name.toLowerCase().includes(lowerSearch)
      );
      return serviceMatches;
    }
    
    return categoryMatches;
  });

  // Filter services based on active filter
  const getFilteredServices = (services) => {
    if (!services) return [];
    
    if (activeFilter === "low") {
      return [...services].sort((a, b) => a.priceNumber - b.priceNumber);
    }
    
    if (activeFilter === "high") {
      return [...services].sort((a, b) => b.priceNumber - a.priceNumber);
    }
    
    return services;
  };

  if (loading) {
    return (
      <section className="tp-page">
        <div className="tp-container">
          <div className="tp-loading">
            <div className="tp-loading-spinner"></div>
            <p>Loading pricing information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-page" style={{paddingTop:"120px"}}>
      <div className="tp-container">
        
        {/* Header */}
        <div className="tp-header">
          <div className="tp-badge">
            <i className="fas fa-tag"></i>
            <span>Complete Price List</span>
          </div>
          
          <h1 className="tp-title">
            Full 
            <span className="tp-highlight"> Service & Price</span> List
          </h1>
          
          <p className="tp-subtitle">
            Browse all our professional laundry services with transparent pricing. 
            No hidden fees, just quality service.
          </p>

          {/* Search and Filter Section */}
          <div className="tp-search-filter">
            <div className="tp-search-wrapper">
              <div className="tp-search-container">
                <i className="fas fa-search tp-search-icon"></i>
                <input
                  type="text"
                  className="tp-search-input"
                  placeholder="Search services or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="tp-search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="tp-filter-wrapper">
              <div className="tp-filter-buttons">
                <button 
                  className={`tp-filter-btn ${activeFilter === "all" ? "active" : ""}`}
                  onClick={() => setActiveFilter("all")}
                >
                  <i className="fas fa-list"></i>
                  All Services
                </button>
                <button 
                  className={`tp-filter-btn ${activeFilter === "low" ? "active" : ""}`}
                  onClick={() => setActiveFilter("low")}
                >
                  <i className="fas fa-arrow-down-short-wide"></i>
                  Price: Low to High
                </button>
                <button 
                  className={`tp-filter-btn ${activeFilter === "high" ? "active" : ""}`}
                  onClick={() => setActiveFilter("high")}
                >
                  <i className="fas fa-arrow-down-wide-short"></i>
                  Price: High to Low
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="tp-search-info">
            <div className="tp-search-results">
              <i className="fas fa-search"></i>
              <p>
                Showing results for "<strong>{searchTerm}</strong>"
                {filteredCategories.length > 0 && ` - ${filteredCategories.length} category match${filteredCategories.length === 1 ? '' : 'es'}`}
              </p>
            </div>
            <button 
              className="tp-clear-search"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="tp-cards-grid">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, index) => {
              const services = getFilteredServices(categoryMap[cat]);
              const isOpen = openCategory === cat;
              
              return (
                <div 
                  key={cat} 
                  className={`tp-card ${isOpen ? "open" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Category Header */}
                  <button
                    className="tp-card-header"
                    onClick={() => toggleCategory(cat)}
                    aria-expanded={isOpen}
                  >
                    <div className="tp-category-icon">
                      <i className="fas fa-tshirt"></i>
                    </div>
                    <div className="tp-category-info">
                      <h3 className="tp-category-name">{cat}</h3>
                      <div className="tp-category-meta">
                        <span className="tp-service-count">
                          <i className="fas fa-list-check"></i>
                          {categoryMap[cat]?.length || 0} services
                        </span>
                        <span className="tp-price-range">
                          £{categoryMap[cat] && categoryMap[cat].length > 0 
                            ? Math.min(...categoryMap[cat].map(s => s.priceNumber)).toFixed(2) 
                            : '0.00'} - £{categoryMap[cat] && categoryMap[cat].length > 0 
                            ? Math.max(...categoryMap[cat].map(s => s.priceNumber)).toFixed(2) 
                            : '0.00'}
                        </span>
                      </div>
                    </div>
                    <div className="tp-toggle-icon">
                      <i className={`fas fa-chevron-down ${isOpen ? "rotated" : ""}`}></i>
                    </div>
                  </button>

                  {/* Category Contents */}
                  <div className={`tp-card-body ${isOpen ? "show" : ""}`}>
                    <div className="tp-table-wrapper">
                      <table className="tp-table">
                        <thead>
                          <tr>
                            <th className="tp-table-service">Service</th>
                            <th className="tp-table-price">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((item, idx) => (
                            <tr key={idx} className="tp-table-row">
                              <td className="tp-service-cell">
                                <div className="tp-service-name">{item.name}</div>
                              </td>
                              <td className="tp-price-cell">
                                <span className="tp-price-value">{item.price}</span>
                                <div className="tp-price-note">per item</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Category Footer */}
                    <div className="tp-card-footer">
                      <div className="tp-total-summary">
                        <div className="tp-summary-item">
                          <i className="fas fa-list"></i>
                          <span>{services.length} total services</span>
                        </div>
                      </div>
                      <button 
                        className="tp-book-now-btn"
                        onClick={() => navigate('/services')}
                      >
                        <i className="fas fa-calendar-check"></i>
                        Book {cat} Services
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) // <-- This closing parenthesis and bracket were missing
          ) : (
            <div className="tp-no-results">
              <div className="tp-no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No matching services found</h3>
              <p>Try a different search term or browse all categories</p>
              <button 
                className="tp-reset-btn"
                onClick={() => setSearchTerm("")}
              >
                <i className="fas fa-rotate-left"></i>
                Show All Categories
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="tp-cta">
          <div className="tp-cta-content">
            <div className="tp-cta-badge">
              <i className="fas fa-question-circle"></i>
              <span>Need Help?</span>
            </div>
            <h3>Ready to get started?</h3>
            <p>Book our professional laundry services with transparent pricing and exceptional quality.</p>
            <div className="tp-cta-actions">
              <button 
                className="tp-cta-primary"
                onClick={() => navigate('/quick-booking')}
              >
                <i className="fas fa-calendar-alt"></i>
                Book a Service
              </button>
              <button className="tp-cta-secondary" onClick={() => navigate('/contact')}>
                <i className="fas fa-phone"></i>
                Contact Support
              </button>
            </div>
            <div className="tp-cta-note">
              <i className="fas fa-info-circle"></i>
              <span>All prices include professional cleaning, pressing, and eco-friendly detergents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TotalPricing;