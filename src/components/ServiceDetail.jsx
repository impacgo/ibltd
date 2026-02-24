// src/components/ServiceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Shield, Truck, Star, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import "./ServiceDetail.css";

const API_BASE = "https://api.ironingboy.com";

// Add this function at the top of ServiceDetail.jsx, after the imports
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const ServiceDetail = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Category icons mapping
  const categoryIcons = {
    1: "🧺", // Laundry
    2: "🛌", // Dry Cleaning
    3: "🛍️", // Home
    4: "🛋️", // Footwear
    5: "👖", // Clothing
    6: "🫧", // Bags
    7: "👔", // Upholstery
    8: "🧥", // Baby Items
    9: "👟", // Professional
    10: "🛠️",
  };

  // Get category icon
  const getCategoryIcon = (id) => {
    return categoryIcons[id] || "✨";
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setDebugInfo(`Starting fetch for slug: ${categorySlug}`);
        
        // First, fetch all categories to find the matching slug
        setDebugInfo("Fetching categories...");
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        setDebugInfo(`Categories response: ${JSON.stringify(categoriesData).substring(0, 200)}...`);
        
        // Handle different response formats
        let categories = [];
        if (Array.isArray(categoriesData)) {
          categories = categoriesData;
        } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
          categories = categoriesData.data;
        } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
          categories = categoriesData.categories;
        }
        
        setDebugInfo(`Found ${categories.length} categories`);
        
        // Find the category that matches the slug
        const foundCategory = categories.find(cat => {
          const catSlug = slugify(cat.name);
          const match = catSlug === categorySlug;
          if (match) {
            setDebugInfo(`Matched: ${cat.name} (ID: ${cat.id}) -> ${catSlug}`);
          }
          return match;
        });
        
        if (!foundCategory) {
          setDebugInfo(`No category found for slug: ${categorySlug}. Available categories: ${categories.map(c => slugify(c.name)).join(', ')}`);
          throw new Error("Category not found");
        }
        
        setCategory(foundCategory);
        setCategoryId(foundCategory.id);
        setDebugInfo(`Found category: ${foundCategory.name} (ID: ${foundCategory.id})`);
        
        // Try multiple endpoints for products
        const productEndpoints = [
          `${API_BASE}/products`,
          `${API_BASE}/products1`,
          `${API_BASE}/services`,
          `${API_BASE}/items`
        ];
        
        let products = [];
        let lastError = "";
        
        for (const endpoint of productEndpoints) {
          try {
            setDebugInfo(`Trying endpoint: ${endpoint}`);
            const prodResponse = await fetch(endpoint);
            
            if (prodResponse.ok) {
              const prodJson = await prodResponse.json();
              setDebugInfo(`Endpoint ${endpoint} response structure: ${JSON.stringify(prodJson).substring(0, 100)}...`);
              
              // Handle different response formats
              if (Array.isArray(prodJson)) {
                products = prodJson;
              } else if (prodJson.data && Array.isArray(prodJson.data)) {
                products = prodJson.data;
              } else if (prodJson.products && Array.isArray(prodJson.products)) {
                products = prodJson.products;
              } else if (prodJson.services && Array.isArray(prodJson.services)) {
                products = prodJson.services;
              } else if (prodJson.items && Array.isArray(prodJson.items)) {
                products = prodJson.items;
              }
              
              if (products.length > 0) {
                setDebugInfo(`Found ${products.length} products from ${endpoint}`);
                break;
              }
            }
          } catch (err) {
            lastError = err.message;
            setDebugInfo(`Failed to fetch from ${endpoint}: ${err.message}`);
          }
        }
        
        // Filter products for this category and format them
        const categoryServices = products
          .filter(p => {
            // Try different property names for category_id
            const catId = p.category_id || p.categoryId || p.category || p.cat_id;
            return catId && catId.toString() === foundCategory.id.toString();
          })
          .map((p, index) => ({
            id: p.id || index,
            name: p.name || p.title || p.service_name || "Service",
            price: p.price ?? p.standard_price ?? p.cost ?? p.amount ?? 0,
            estimated_time: p.estimated_time || p.duration || p.time || "1-2 hours",
            is_popular: p.popular || p.is_popular || p.featured || false,
          }));
        
        setServices(categoryServices);
        setDebugInfo(`Found ${categoryServices.length} services for category ${foundCategory.name}`);
        
        if (categoryServices.length === 0) {
          setError("No services available in this category yet");
          setDebugInfo(prev => prev + "\nNo services found. Products data sample: " + JSON.stringify(products[0]));
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to load service details: ${error.message}`);
        setDebugInfo(prev => prev + `\nError: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug]);

  const handleBookNow = (service) => {
    // Store selected service in localStorage for QuickBooking
    const serviceData = {
      id: service.id,
      name: service.name,
      price: service.price,
      category: category?.name || "Service",
      icon: getCategoryIcon(categoryId)
    };
    localStorage.setItem("selectedService", JSON.stringify(serviceData));
    navigate("/quick-booking");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleAllPrices = () => {
    setShowAllPrices(!showAllPrices);
  };

  if (loading) {
    return (
      <div className="service-page">
        <div className="service-loading">
          <div className="spinner-container">
            <div className="service-spinner"></div>
            <p>Loading service details...</p>
            <p className="service-debug-info">{debugInfo}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="service-page">
        <div className="service-error">
          <div className="service-error-card">
            <div className="service-error-icon">⚠️</div>
            <h2>Service Not Available</h2>
            <p>{error || "The service you're looking for doesn't exist."}</p>
            {debugInfo && (
              <div className="service-debug-info">
                <details>
                  <summary>Debug Info</summary>
                  <pre>{debugInfo}</pre>
                </details>
              </div>
            )}
            <div className="service-error-actions">
              <button className="service-btn-secondary" onClick={handleBack}>
                Go Back
              </button>
              <button className="service-btn-primary" onClick={() => navigate("/services")}>
                Browse All Services
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryIcon = getCategoryIcon(categoryId);
  const categoryName = category.name;
  const displayedServices = showAllPrices ? services : services.slice(0, 5);

  return (
    <div className="service-page">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="service-debug-info" style={{
          background: '#f0f0f0',
          padding: '10px',
          margin: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          display: 'none' // Change to 'block' to see debug info
        }}>
          <details>
            <summary>Debug Info</summary>
            <pre>{debugInfo}</pre>
          </details>
        </div>
      )}

      {/* Service Info Card */}
      <div className="service-container">
        <div className="service-card">
          <div className="service-card-header">
            <div className="service-card-icon">
              <span className="service-icon-large">{categoryIcon}</span>
            </div>
            <div className="service-card-header-content">
              <h1 className="service-card-title">{categoryName} Services</h1>
              <p className="service-card-description">
                Expert cleaning with quality guarantee and free pickup & delivery
              </p>
            </div>
          </div>

          <div className="service-highlights">
            <div className="service-highlight-item">
              <div className="service-highlight-icon">
                <Truck size={20} />
              </div>
              <div className="service-highlight-content">
                <span className="service-highlight-title">Free Pickup & Delivery</span>
                <span className="service-highlight-subtitle">At your convenience</span>
              </div>
            </div>
            <div className="service-highlight-item">
              <div className="service-highlight-icon">
                <Shield size={20} />
              </div>
              <div className="service-highlight-content">
                <span className="service-highlight-title">100% Satisfaction</span>
                <span className="service-highlight-subtitle">Quality guaranteed</span>
              </div>
            </div>
            <div className="service-highlight-item">
              <div className="service-highlight-icon">
                <Clock size={20} />
              </div>
              <div className="service-highlight-content">
                <span className="service-highlight-title">Same Day Service</span>
                <span className="service-highlight-subtitle">Fast turnaround</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="service-cta-section">
          <div className="service-cta-card">
            <div className="service-cta-icon">🚀</div>
            <div className="service-cta-content">
              <h2>Ready to Get Started?</h2>
              <p>Book your service in just 60 seconds with our easy booking process</p>
            </div>
            <div className="service-cta-actions">
              {services.length > 0 ? (
                <button 
                  className="service-btn-primary service-btn-large"
                  onClick={() => handleBookNow(services[0])}
                >
                  <Calendar size={20} />
                  Book Now
                </button>
              ) : (
                <button 
                  className="service-btn-primary service-btn-large"
                  onClick={() => navigate("/contact")}
                >
                  Contact Us
                </button>
              )}
              <button 
                className="service-btn-secondary service-btn-large"
                onClick={() => navigate("/services")}
              >
                Browse All Services
              </button>
            </div>
            <div className="service-cta-benefits">
              <div className="service-benefit-item">
                <div className="service-benefit-icon">✅</div>
                <span>No hidden fees</span>
              </div>
              <div className="service-benefit-item">
                <div className="service-benefit-icon">✅</div>
                <span>Flexible scheduling</span>
              </div>
              <div className="service-benefit-item">
                <div className="service-benefit-icon">✅</div>
                <span>Quality guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="service-pricing-section">
          <div className="service-pricing-header">
            <h2>Service Pricing</h2>
            <p>Transparent pricing with no hidden fees</p>
          </div>

          {services.length > 0 ? (
            <div className="service-pricing-content">
              <div className="service-price-table-container">
                <div className="service-price-table-header">
                  <div className="service-table-header-item service-col">Service</div>
                  <div className="service-table-header-item price-col">Price</div>
                </div>
                
                <div className="service-price-table-body">
                  {displayedServices.map((service, index) => (
                    <div key={service.id} className={`service-price-row ${service.is_popular ? 'popular' : ''}`}>
                      <div className="service-row-item service-col">
                        <div className="service-name-wrapper">
                          <span className="service-number">#{index + 1}</span>
                          <div className="service-details">
                            <span className="service-name">{service.name}</span>
                            {service.is_popular && (
                              <span className="service-popular-badge">
                                <Star size={12} />
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="service-row-item price-col">
                        <div className="service-price-amount">
                          £{parseFloat(service.price).toFixed(2)}
                        </div>
                        <div className="service-price-note">Starting from</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {services.length > 5 && (
                  <div className="service-view-more-section">
                    <button 
                      className="service-view-more-btn"
                      onClick={toggleAllPrices}
                    >
                      {showAllPrices ? (
                        <>
                          <ChevronUp size={16} />
                          Show Less Prices
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          View All {services.length} Prices
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="service-pricing-note">
                <div className="service-note-icon">💡</div>
                <div className="service-note-content">
                  <h4>Price Guarantee</h4>
                  <p>Our prices are all-inclusive with no hidden charges. The price you see is the price you pay.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="service-no-services">
              <div className="service-no-services-icon">📋</div>
              <h3>No Services Available</h3>
              <p>We're currently updating our service offerings. Please check back soon or contact us for custom quotes.</p>
              <button 
                className="service-btn-secondary"
                onClick={() => navigate("/services")}
              >
                Browse Other Categories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;