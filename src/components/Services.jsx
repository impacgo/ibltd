// // src/components/Services.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Services.css";

// const API_BASE = "https://api.ironingboy.com";

// const serviceData = [
//   {
//     id: 1,
//     name: "Laundry",
//     icon: "fa-tshirt",
//     description: "Professional washing, drying & folding service",
//     color: "#3B82F6",
//     gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
//     features: ["Eco-friendly detergents", "Same-day service", "Free pickup"]
//   },
//   {
//     id: 2,
//     name: "Dry Cleaning",
//     icon: "fa-snowflake",
//     description: "Gentle care for delicate & special fabrics",
//     color: "#8B5CF6",
//     gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
//     features: ["Delicate fabrics", "Stain removal", "Premium care"]
//   },
//   {
//     id: 3,
//     name: "Ironing/Pressing",
//     icon: "fa-fire",
//     description: "Crisp, wrinkle-free finish for all garments",
//     color: "#EC4899",
//     gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
//     features: ["Professional press", "Steam finishing", "Fold or hang"]
//   },
//   {
//     id: 4,
//     name: "Service Wash",
//     icon: "fa-soap",
//     description: "Complete laundry with premium detergents",
//     color: "#10B981",
//     gradient: "linear-gradient(135deg, #10B981, #059669)",
//     features: ["Premium detergents", "Full service", "Quality check"]
//   },
//   {
//     id: 5,
//     name: "Repair & Alteration",
//     icon: "fa-scissors",
//     description: "Expert tailoring & perfect fit adjustments",
//     color: "#F59E0B",
//     gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
//     features: ["Expert tailors", "Quick turnaround", "Perfect fit"]
//   },
//   {
//     id: 6,
//     name: "Shoe Cleaning",
//     icon: "fa-shoe-prints",
//     description: "Deep cleaning & conditioning for footwear",
//     color: "#6366F1",
//     gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
//     features: ["Deep clean", "Conditioning", "Waterproofing"]
//   }
// ];

// const Services = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`${API_BASE}/categories`);
        
//         if (!res.ok) {
//           throw new Error(`Failed to fetch: ${res.status}`);
//         }
        
//         const json = await res.json();
//         setCategories(json.data || []);
//         setError(null);
//       } catch (e) {
//         console.error("Category loading failed:", e);
//         setError("Unable to load services. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCategories();
//   }, []);

//   const handleBookNow = (serviceName = null) => {
//     if (serviceName) {
//       navigate("/quick-booking", { state: { service: serviceName } });
//     } else {
//       navigate("/quick-booking");
//     }
//   };

//   return (
//     <section className="services-section" id="services">
//       <div className="services-container">
        
//         {/* Header Section */}
//         <div className="services-header">
//           <div className="services-badge">
//             <i className="fas fa-star"></i>
//             <span>Premium Services</span>
//           </div>
          
//           <h1 className="services-title">
//             Our <span className="services-highlight">Laundry Services</span>
//           </h1>
          
//           <p className="services-subtitle">
//             Experience premium laundry services with expert care, modern technology, 
//             and convenient pickup & delivery across London and Oxford.
//           </p>
//         </div>

//         {/* Services Grid */}
//         <div className="services-grid">
//           {serviceData.map((service, index) => (
//             <div
//               key={service.id}
//               className="service-card"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               <div className="service-number">0{service.id}</div>
              
//               <div className="service-icon-wrapper">
//                 <div 
//                   className="service-icon" 
//                   style={{ background: service.gradient }}
//                 >
//                   <i className={`fas ${service.icon}`}></i>
//                   <div className="icon-glow"></div>
//                 </div>
//               </div>
              
//               <div className="service-content">
//                 <h1 className="service-name" style={{ fontSize: "1.75rem", fontWeight: 800 ,color:"#1a1a1a",}}>{service.name}</h1>
//                 <p className="service-description">{service.description}</p>
                
//                 <div className="service-features">
//                   {service.features.map((feature, idx) => (
//                     <div key={idx} className="feature-item">
//                       <i className="fas fa-check-circle"></i>
//                       <span>{feature}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="service-action">
//                 <button 
//                   className="service-book-btn"
//                   onClick={() => handleBookNow(service.name)}
//                 >
//                   <span>Book Now</span>
//                   <i className="fas fa-arrow-right"></i>
//                 </button>
//               </div>
              
//               <div className="service-card-border" style={{ background: service.gradient }}></div>
//             </div>
//           ))}
//         </div>

//         {/* CTA Section */}
//         <div className="services-cta">
//           <div className="cta-content">
//             <div className="cta-badge">
//               <i className="fas fa-crown"></i>
//               <span>Premium Service Guarantee</span>
//             </div>
            
//             <h2 className="cta-title" style={{color:"#1a1a1a"}}>
//               Ready for <span className="cta-highlight">Professional Care?</span>
//             </h2>
            
//             <p className="cta-subtitle" style={{color:"#4a5568"}}>
//               Schedule a pickup in just 2 minutes. We handle everything with 
//               premium care and attention to detail.
//             </p>
            
//             <div className="cta-grid">
//               <div className="cta-features">
//                 <div className="feature">
//                   <div className="feature-icon">
//                     <i className="fas fa-truck-fast"></i>
//                   </div>
//                   <div className="feature-content">
//                     <h4>Free Pickup & Delivery</h4>
//                     <p style={{color:"#4a5568"}}>At your doorstep, anytime that suits you</p>
//                   </div>
//                 </div>
                
//                 <div className="feature">
//                   <div className="feature-icon">
//                     <i className="fas fa-shield-alt"></i>
//                   </div>
//                   <div className="feature-content">
//                     <h4>Quality Assured</h4>
//                     <p style={{color:"#4a5568"}}>100% satisfaction guarantee on all services</p>
//                   </div>
//                 </div>
                
//                 <div className="feature">
//                   <div className="feature-icon">
//                     <i className="fas fa-leaf"></i>
//                   </div>
//                   <div className="feature-content">
//                     <h4>Eco-Friendly</h4>
//                     <p style={{color:"#4a5568"}}>Green cleaning solutions for a better planet</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="cta-card" style={{background:"#242323ff"}}>
//                 <div className="cta-offer" >
//                   <div className="offer-badge">
//                     <i className="fas fa-gift"></i>
//                     <span>Special Offer</span>
//                   </div>
//                   <h3>Get Special offers on Your First Order</h3>
//                   <ul className="offer-benefits">
//                     <li>
//                       <i className="fas fa-check-circle"></i>
//                       <span>Free pickup & delivery</span>
//                     </li>
//                     <li>
//                       <i className="fas fa-check-circle"></i>
//                       <span>Premium quality service</span>
//                     </li>
//                     <li>
//                       <i className="fas fa-check-circle"></i>
//                       <span>Same-day service available</span>
//                     </li>
//                   </ul>
//                 </div>
                
//                 <button 
//                   className="cta-book-btn" 
//                   onClick={() => handleBookNow()}
//                 >
//                   <i className="fas fa-calendar-check"></i>
//                   <span>Schedule Your Pickup</span>
//                   <i className="fas fa-arrow-right"></i>
//                 </button>
                
//                 <div className="cta-note">
//                   <i className="fas fa-clock"></i>
//                   <span>Same-day service available for orders before 12 PM</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="trust-badges">
//               <div className="trust-item">
//                 <i className="fas fa-shield-check"></i>
//                 <span>Secure Payment</span>
//               </div>
//               <div className="trust-item">
//                 <i className="fas fa-award"></i>
//                 <span>Quality Certified</span>
//               </div>
//               <div className="trust-item">
//                 <i className="fas fa-headset"></i>
//                 <span>24/7 Support</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Services;

// src/components/Services.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const API_BASE = "https://api.ironingboy.com";

const serviceData = [
  {
    id: 1,
    name: "Laundry",
    icon: "fa-tshirt",
    description: "Professional washing, drying & folding service",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    features: ["Eco-friendly detergents", "Same-day service", "Free pickup"],
    filterType: "Laundry",
    searchTerms: ["Laundry", "Wash", "Cleaning"],
    category: "laundry",
    items: [
      "Shirts", "T-Shirts", "Blouses", "Pants", "Suits", "Dresses", 
      "Jackets", "Underwear", "Bedding", "Towels"
    ]
  },
  {
    id: 2,
    name: "Dry Cleaning",
    icon: "fa-snowflake",
    description: "Gentle care for delicate & special fabrics",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    features: ["Delicate fabrics", "Stain removal", "Premium care"],
    filterType: "Dry Clean",
    searchTerms: ["Dry Clean", "Dry Cleaning", "Delicate"],
    category: "dry_cleaning",
    items: [
      "Suits", "Dresses", "Woolens", "Silks", "Leather"
    ]
  },
  {
    id: 3,
    name: "Ironing/Pressing",
    icon: "fa-fire",
    description: "Crisp, wrinkle-free finish for all garments",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
    features: ["Professional press", "Steam finishing", "Fold or hang"],
    filterType: "Ironing",
    searchTerms: ["Ironing", "Pressing", "Press"],
    category: "ironing",
    items: [
      "Shirts", "Pants", "Dresses", "Bed Linen", "Table Linen"
    ]
  },
  {
    id: 4,
    name: "Service Wash",
    icon: "fa-soap",
    description: "Complete laundry with premium detergents",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    features: ["Premium detergents", "Full service", "Quality check"],
    filterType: "Service Wash",
    searchTerms: ["Service Wash", "Wash Service", "Complete"],
    category: "service_wash",
    items: [
      "Clothing Bundle", "Mixed Bundle"
    ]
  },
  {
    id: 5,
    name: "Repair & Alteration",
    icon: "fa-scissors",
    description: "Expert tailoring & perfect fit adjustments",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    features: ["Expert tailors", "Quick turnaround", "Perfect fit"],
    filterType: "Repair & Alteration",
    searchTerms: ["Repair", "Alteration", "Tailoring"],
    category: "repair",
    items: [
      "Alterations", "Repairs", "Zippers", "Buttons"
    ]
  },
  {
    id: 6,
    name: "Shoe Cleaning",
    icon: "fa-shoe-prints",
    description: "Deep cleaning & conditioning for footwear",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
    features: ["Deep clean", "Conditioning", "Waterproofing"],
    filterType: "Shoe Cleaning",
    searchTerms: ["Shoe", "Footwear", "Shoes"],
    category: "shoe_cleaning",
    items: [
      "Formal Shoes", "Sneakers", "Boots"
    ]
  }
];

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/categories`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const json = await res.json();
        setCategories(json.data || []);
        setError(null);
      } catch (e) {
        console.error("Category loading failed:", e);
        setError("Unable to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

const handleBookNow = (service = null) => {
  if (service) {
    // Navigate to ServicePricing page with the selected service
navigate("/service-pricing", {
  state: {
    service: service.name,
    serviceCategory: service.category,
    serviceData: service
  }
});

  } else {
    // Navigate to ServicePricing page without specific service
    navigate("/service-pricing");
  }
};

const handleViewPricing = (service) => {
  navigate("/service-pricing", { 
    state: { 
      serviceName: service.name,
      filterType: service.filterType,
      searchTerms: service.searchTerms,
      serviceCategory: service.category
    } 
  });
};

  const handleQuickBooking = (serviceName = null) => {
    // Keep the existing quick-booking functionality
    if (serviceName) {
      navigate("/quick-booking", { state: { service: serviceName } });
    } else {
      navigate("/quick-booking");
    }
  };

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        
        {/* Header Section */}
        <div className="services-header">
          <div className="services-badge">
            <i className="fas fa-star"></i>
            <span>Premium Services</span>
          </div>
          
          <h1 className="services-title">
            Our <span className="services-highlight">Laundry Services</span>
          </h1>
          
          <p className="services-subtitle">
            Experience premium laundry services with expert care, modern technology, 
            and convenient pickup & delivery across London and Oxford.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {serviceData.map((service, index) => (
            <div
              key={service.id}
              className="service-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="service-number">0{service.id}</div>
              
              <div className="service-icon-wrapper">
                <div 
                  className="service-icon" 
                  style={{ background: service.gradient }}
                >
                  <i className={`fas ${service.icon}`}></i>
                  <div className="icon-glow"></div>
                </div>
              </div>
              
              <div className="service-content">
                <h1 className="service-name" style={{ fontSize: "1.75rem", fontWeight: 800 ,color:"#1a1a1a",}}>
                  {service.name}
                </h1>
                <p className="service-description">{service.description}</p>
                
                <div className="service-features">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Service Items Preview */}
                <div className="service-items-preview">
                  <div className="preview-label">
                    <i className="fas fa-list"></i>
                    <span>Includes:</span>
                  </div>
                  <div className="preview-items">
                    {service.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="preview-item">{item}</span>
                    ))}
                    {service.items.length > 3 && (
                      <span className="preview-more">+{service.items.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="service-action">
                <button 
                  className="service-book-btn"
                  onClick={() => handleBookNow(service)}
                >
                  <span>Book Now</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="service-card-border" style={{ background: service.gradient }}></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="services-cta">
          <div className="cta-content">
            <div className="cta-badge">
              <i className="fas fa-crown"></i>
              <span>Premium Service Guarantee</span>
            </div>
            
            <h2 className="cta-title" style={{color:"#1a1a1a"}}>
              Ready for <span className="cta-highlight">Professional Care?</span>
            </h2>
            
            <p className="cta-subtitle" style={{color:"#4a5568"}}>
              Schedule a pickup in just 2 minutes. We handle everything with 
              premium care and attention to detail.
            </p>
            
            <div className="cta-grid">
              <div className="cta-features">
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-truck-fast"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Free Pickup & Delivery</h4>
                    <p style={{color:"#4a5568"}}>At your doorstep, anytime that suits you</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Quality Assured</h4>
                    <p style={{color:"#4a5568"}}>100% satisfaction guarantee on all services</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Eco-Friendly</h4>
                    <p style={{color:"#4a5568"}}>Green cleaning solutions for a better planet</p>
                  </div>
                </div>
              </div>
              
              <div className="cta-card" style={{background:"#242323ff"}}>
                <div className="cta-offer" >
                  <div className="offer-badge">
                    <i className="fas fa-gift"></i>
                    <span>Special Offer</span>
                  </div>
                  <h3>Get Special offers on Your First Order</h3>
                  <ul className="offer-benefits">
                    <li>
                      <i className="fas fa-check-circle"></i>
                      <span>Free pickup & delivery</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle"></i>
                      <span>Premium quality service</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle"></i>
                      <span>Same-day service available</span>
                    </li>
                  </ul>
                </div>
                
<button 
  className="cta-book-btn" 
  onClick={() => navigate("/services/pricing")}
>
  <i className="fas fa-calendar-check"></i>
  <span>Browse All Services</span>
  <i className="fas fa-arrow-right"></i>
</button>
                
                <div className="cta-note">
                  <i className="fas fa-clock"></i>
                  <span>Same-day service available for orders before 12 PM</span>
                </div>
              </div>
            </div>
            
            <div className="trust-badges">
              <div className="trust-item">
                <i className="fas fa-shield-check"></i>
                <span>Secure Payment</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-award"></i>
                <span>Quality Certified</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-headset"></i>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;