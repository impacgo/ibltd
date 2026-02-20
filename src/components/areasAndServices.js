// src/data/areasAndServices.js
import image from "../images/bedding.webp";
import image2 from "../images/bedding.webp";
import image3 from "../images/bedding.webp";
import image4 from "../images/bedding.webp";
import image5 from "../images/bedding.webp";
import image6 from "../images/bedding.webp";
import image7 from "../images/bedding.webp";
import image8 from "../images/bedding.webp";

/**
 * Areas: name + slug + postcodes + short description
 */
export const AREAS = [
  { name: "Paddington", slug: "paddington", postcodes: ["W2"], desc: "Central London hub near Paddington Station" },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"], desc: "Famous for Portobello Road Market" },
  { name: "Kensington", slug: "kensington", postcodes: ["W8","SW7"], desc: "Royal borough with museums & gardens" },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"], desc: "Residential area with exhibition center" },
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3","SW10"], desc: "Upscale area with King's Road" },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"], desc: "Riverside area with Fulham Palace" },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"], desc: "Thames-side location with bridge" },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12","W14"], desc: "Home to Westfield shopping center" },
];

/**
 * Your services array with updated descriptions matching the titles
 */
export const SERVICES = [
  {
    id: 1,
    title: "Accessories",
    slug: "accessories",
    description: "Professional cleaning and care for bags, scarves, ties, and fashion accessories.",
    image: image,
  },
  {
    id: 2,
    title: "Bedding",
    slug: "bedding",
    description: "Deep cleaning for duvets, pillows, sheets, and all bed linens for fresh, hygienic sleep.",
    image: image2,
  },
  {
    id: 3,
    title: "Full Body",
    slug: "fullbody",
    description: "Complete garment care including washing, drying, and expert pressing for full outfits.",
    image: image3,
  },
  {
    id: 4,
    title: "HouseHold",
    slug: "household",
    description: "Comprehensive cleaning for curtains, cushion covers, tablecloths, and home textiles.",
    image: image4,
  },
  {
    id: 5,
    title: "Lower",
    slug: "lower",
    description: "Specialized care for trousers, skirts, jeans, and all lower body garments.",
    image: image6,
  },
  {
    id: 6,
    title: "ServiceWash",
    slug: "servicewash",
    description: "Complete laundry service: we collect, wash, dry, and return your clothes folded.",
    image: image5,
  },
  {
    id: 7,
    title: "Shirts",
    slug: "shirts",
    description: "Professional washing, starching, and crisp ironing for dress and casual shirts.",
    image: image7,
  },
  {
    id: 8,
    title: "Upper",
    slug: "upper",
    description: "Expert cleaning for tops, blouses, jackets, and all upper body clothing.",
    image: image8,
  },
  {
    id: 9,
    title: "Shoes",
    slug: "shoes",
    description: "Professional shoe cleaning, polishing, and leather care for all footwear types.",
    image: image8,
  },
  {
    id: 10,
    title: "Repair & Alteration",
    slug: "repair-alteration",
    description: "Expert mending, hemming, zipper repairs, and clothing alterations for perfect fit.",
    image: image8,
  },
];

// Helper function to create slug from service name
export const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// API function to fetch services from backend
export const fetchServicesFromBackend = async () => {
  try {
    const API_BASE = "https://api.ironingboy.com";
    const response = await fetch(`${API_BASE}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const backendServices = data.data || data; // Handle both array and object responses
    
    // Transform backend services to frontend format
    return backendServices.map((service, index) => {
      const serviceName = service.name || `Service ${index + 1}`;
      const slug = createSlug(serviceName);
      
      // Find matching service from local SERVICES to get description and image
      const matchingService = SERVICES.find(s => 
        s.title.toLowerCase() === serviceName.toLowerCase() || 
        s.slug === slug
      );
      
      return {
        id: service.id || index + 1,
        title: serviceName,
        slug: slug,
        description: matchingService?.description || service.description || `Professional ${serviceName.toLowerCase()} service.`,
        image: matchingService?.image || image, // Use local image if available
        backendId: service.id,
        originalData: service
      };
    });
    
  } catch (error) {
    console.error("Error fetching services from backend:", error);
    return null; // Return null to indicate error
  }
};

// Export as FALLBACK_SERVICES for backward compatibility
export const FALLBACK_SERVICES = SERVICES;