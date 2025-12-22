// src/components/AreaDetails.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./AreaDetails.css";

// Import all local images for services
import accessoriesImg from "../images/accessories.webp";
import beddingImg from "../images/bedding.webp";
import fullBodyImg from "../images/shirtshang.webp";
import householdImg from "../images/household.webp";
import lowerImg from "../images/lower.webp";
import serviceWashImg from "../images/servicewash.webp";
import shirtsImg from "../images/shirtshang.webp";
import upperImg from "../images/upper.webp";
import shoesImg from "../images/shoes.webp";
import repairImg from "../images/repair.webp";

// Local AREAS data
const AREAS = [
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3", "SW10"] },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"] },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"] },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"] },
  { name: "Kensington", slug: "kensington", postcodes: ["W8", "SW7"] },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"] },
  { name: "Oxford", slug: "oxford", postcodes: ["OX1", "OX2","OX3","OX4"] },
  { name: "Paddington", slug: "paddington", postcodes: ["W2"] },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12", "W14"] },
];

// Define the 10 specific services with their details
const SPECIFIC_SERVICES = [
  { 
    id: 1, 
    slug: "accessories", 
    title: "Accessories Cleaning", 
    description: "Professional cleaning for scarves, ties, gloves, and other accessories"
  },
  { 
    id: 2, 
    slug: "bedding", 
    title: "Bedding Cleaning", 
    description: "Deep cleaning for duvets, pillows, sheets, and mattress covers"
  },
  { 
    id: 3, 
    slug: "fullbody", 
    title: "Full Body Garments", 
    description: "Complete cleaning for dresses, gowns, and full-length garments"
  },
  { 
    id: 4, 
    slug: "household", 
    title: "Household Items", 
    description: "Cleaning for curtains, cushion covers, tablecloths, and other household items"
  },
  { 
    id: 5, 
    slug: "lower", 
    title: "Lower Garments", 
    description: "Professional cleaning for trousers, skirts, shorts, and other lower garments"
  },
  { 
    id: 6, 
    slug: "servicewash", 
    title: "Service Wash", 
    description: "Complete laundry service including washing, drying, and folding"
  },
  { 
    id: 7, 
    slug: "shirts", 
    title: "Shirts & Tops", 
    description: "Expert cleaning and ironing for shirts, blouses, and tops"
  },
  { 
    id: 8, 
    slug: "upper", 
    title: "Upper Garments", 
    description: "Cleaning for jackets, jumpers, sweaters, and upper body garments"
  },
  { 
    id: 9, 
    slug: "shoes", 
    title: "Shoes Cleaning", 
    description: "Professional cleaning and conditioning for all types of shoes"
  },
  { 
    id: 10, 
    slug: "repair-alt", 
    title: "Repair & Alteration", 
    description: "Professional clothing repair, alterations, and tailoring services"
  },
];

// Image mapping for services
const serviceImages = {
  "accessories": accessoriesImg,
  "bedding": beddingImg,
  "fullbody": fullBodyImg,
  "household": householdImg,
  "lower": lowerImg,
  "servicewash": serviceWashImg,
  "shirts": shirtsImg,
  "upper": upperImg,
  "shoes": shoesImg,
  "repair-alt": repairImg,
  // Backward compatibility
  "repair-alteration": repairImg,
  "repair-altration": repairImg,
  "ironing": shirtsImg,
  "laundry": serviceWashImg,
  "dry-cleaning": fullBodyImg,
  "leather-cleaning": upperImg,
  "shoes-bags": shoesImg,
};

// Function to fetch services from backend (for compatibility)
const fetchServicesFromBackend = async () => {
  try {
    const API_BASE = "https://api.ironingboy.com";
    const response = await fetch(`${API_BASE}/services`);
    if (response.ok) {
      const data = await response.json();
      return data.data || SPECIFIC_SERVICES;
    }
    return SPECIFIC_SERVICES;
  } catch (error) {
    console.error("Error fetching services:", error);
    return SPECIFIC_SERVICES;
  }
};

export default function AreaDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allServices, setAllServices] = useState([]);

  const area = AREAS.find((a) => a.slug === slug);
  if (!area) return <div className="page-empty">Area Not Found</div>;

  // Fetch services from backend on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        
        // First, try to get categories from backend (like in header)
        const API_BASE = "https://api.ironingboy.com";
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const categories = categoriesData.data || [];
          
          if (categories.length > 0) {
            // Map categories to our service format
            const mappedServices = categories.map(category => {
              // Try to find matching service by name or create new
              const existingService = SPECIFIC_SERVICES.find(service => 
                service.title.toLowerCase().includes(category.name.toLowerCase()) ||
                category.name.toLowerCase().includes(service.title.toLowerCase())
              );
              
              if (existingService) {
                return {
                  ...existingService,
                  id: category.id,
                  name: category.name,
                  title: category.name
                };
              }
              
              // If no match, create from category
              return {
                id: category.id,
                slug: category.name.toLowerCase().replace(/\s+/g, '-'),
                title: category.name,
                description: category.description || "Professional cleaning service",
                name: category.name
              };
            });
            
            setAllServices(mappedServices);
            
            // Filter to only show the 10 specific services
            const filteredServices = SPECIFIC_SERVICES.map(specificService => {
              // Try to find matching service from backend
              const matchedService = mappedServices.find(service => 
                service.slug === specificService.slug ||
                service.title.toLowerCase().includes(specificService.title.toLowerCase())
              );
              
              return matchedService || specificService;
            });
            
            setServices(filteredServices);
          } else {
            // Use specific services if no categories from backend
            setAllServices(SPECIFIC_SERVICES);
            setServices(SPECIFIC_SERVICES);
          }
        } else {
          // Use specific services if API call fails
          setAllServices(SPECIFIC_SERVICES);
          setServices(SPECIFIC_SERVICES);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Unable to load services. Please try again.");
        // Use specific services on error
        setAllServices(SPECIFIC_SERVICES);
        setServices(SPECIFIC_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [slug]);

  const handleSchedulePickup = () => {
    navigate("/quick-booking");
  };

  const handleBookServiceWash = () => {
    navigate("/quick-booking");
  };

  // Function to get image for service
  const getImageForService = (service) => {
    // First try direct slug match
    if (serviceImages[service.slug]) {
      return serviceImages[service.slug];
    }
    
    // Try to find by partial slug match
    for (const [key, image] of Object.entries(serviceImages)) {
      if (service.slug.includes(key) || key.includes(service.slug)) {
        return image;
      }
    }
    
    // Default based on title
    if (service.title.toLowerCase().includes('shirt')) return shirtsImg;
    if (service.title.toLowerCase().includes('shoe')) return shoesImg;
    if (service.title.toLowerCase().includes('bed')) return beddingImg;
    if (service.title.toLowerCase().includes('wash')) return serviceWashImg;
    if (service.title.toLowerCase().includes('repair')) return repairImg;
    if (service.title.toLowerCase().includes('alter')) return repairImg;
    
    // Default image
    return accessoriesImg;
  };

  if (loading) {
    return (
      <div className="area-page">
        <header className="area-hero">
          <div className="area-hero-overlay"></div>
          <div className="area-hero-content container">
            <div className="area-breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/areas">Areas</Link> / {area.name}
            </div>
            <h1 className="area-title">{area.name} Laundry & Dry Cleaning</h1>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="area-page">
      {/* HERO SECTION */}
      <header className="area-hero">
        <div className="area-hero-overlay"></div>

        <div className="area-hero-content container">
          <div className="area-breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/areas">Areas</Link> / {area.name}
          </div>

          <h1 className="area-title">{area.name} Laundry & Dry Cleaning</h1>
          <p className="area-subtitle">
            Premium laundry, ironing, and dry-cleaning services across {area.postcodes.join(", ")}.
          </p>

          <div className="area-hero-buttons">
            <button onClick={handleSchedulePickup} className="btn-primary">
              Schedule Pickup
            </button>
            <Link to="/areas" className="btn-secondary">
              View All Areas
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container">
        <section className="area-main-section">
          {/* LEFT CONTENT */}
          <div className="area-left">
            <h2 className="section-heading">Services in {area.name}</h2>
            <p className="section-description">
              We offer complete garment-care solutions including ironing, dry cleaning, leather care,
              service wash and more.
            </p>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="service-cards-grid">
              {services.map((service) => {
                const serviceImage = getImageForService(service);
                
                return (
                  <Link
                    key={service.id || service.slug}
                    to={`/areas/${slug}/${service.slug}`}
                    className="service-card"
                  >
                    <div
                      className="service-card-img"
                      style={{ backgroundImage: `url(${serviceImage})` }}
                    />
                    <div className="service-card-info">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="area-sidebar">
            <div className="sidebar-card">
              <h4>Area Information</h4>
              <ul>
                <li><strong>Postcodes:</strong> {area.postcodes.join(", ")}</li>
                <li><strong>Free Pickup:</strong> Yes</li>
                <li><strong>Delivery Time:</strong> 24–48 hrs</li>
                <li><strong>Services Available:</strong> {services.length}</li>
              </ul>

              <button
                className="btn-outline"
                onClick={handleBookServiceWash}
              >
                Book Service Wash
              </button>
            </div>

            <div className="sidebar-card small">
              <h5>More Locations</h5>
              {AREAS.map((a) => (
                <Link
                  key={a.slug}
                  to={`/areas/${a.slug}`}
                  className={`location-link ${a.slug === slug ? "active" : ""}`}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </aside>
        </section>

        {/* SEO SECTION */}
        <section className="seo-section">
          <h3>Local Service Pages for {area.name}</h3>
          <p>Explore detailed service pages for {area.name}:</p>

          <ul className="seo-list">
            <li><Link to={`/areas/${slug}`}>/areas/{slug}</Link></li>
            {services.map((service) => (
              <li key={service.slug}>
                <Link to={`/areas/${slug}/${service.slug}`}>/areas/{slug}/{service.slug}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
