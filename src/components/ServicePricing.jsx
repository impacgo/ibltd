import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ServicePricing.css"; // Changed from "./servicePricing.css"

const API_BASE = "https://api.ironingboy.com";

const ServicePricing = () => {
  const services = useMemo(() => [
    {
      id: "laundry",
      name: "Laundry",
      icon: "fa-tshirt",
      emoji: "🧺",
      color: "#3B82F6",
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
      needsFilters: true,
      items: [
        { id: "shirts", name: "Shirts", emoji: "👔", keywords: ["shirt", "formal shirt", "dress shirt", "shirts", "men shirt", "women shirt"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "t_shirts", name: "T-Shirts", emoji: "👕", keywords: ["t-shirt", "tee", "t shirt", "tshirt", "cotton shirt", "t-shirts", "t shirts"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "blouses", name: "Blouses", emoji: "👚", keywords: ["blouse", "top", "women top", "blouses"], gender: ["women"], category: "clothing" },
        { id: "pants", name: "Pants", emoji: "👖", keywords: ["pant", "trouser", "jeans", "pants", "trousers"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "suits", name: "Suits", emoji: "🤵", keywords: ["suit", "2 piece", "3 piece", "suits", "men suit", "women suit"], gender: ["men", "women"], category: "formal" },
        { id: "dresses", name: "Dresses", emoji: "👗", keywords: ["dress", "gown", "evening dress", "dresses"], gender: ["women", "children"], category: "clothing" },
        { id: "jackets", name: "Jackets", emoji: "🧥", keywords: ["jacket", "coat", "blazer", "jackets"], gender: ["men", "women", "children"], category: "outerwear" },
        { id: "underwear", name: "Underwear", emoji: "🩲", keywords: ["underwear", "bra", "panty", "boxer", "brief", "panties"], gender: ["men", "women", "children"], category: "intimate" },
        { id: "bedding", name: "Bedding", emoji: "🛏️", keywords: ["bed sheet", "pillowcase", "duvet", "bedding", "bedsheet", "bed linen"], gender: ["unisex"], category: "home" },
        { id: "towels", name: "Towels", emoji: "🛀", keywords: ["towel", "bath towel", "hand towel", "towels"], gender: ["unisex"], category: "home" },
      ]
    },
    {
      id: "dry_cleaning",
      name: "Dry Cleaning",
      icon: "fa-snowflake",
      emoji: "🧼",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
      needsFilters: true,
      items: [
        { id: "suits_dc", name: "Suits", emoji: "👔", keywords: ["suit", "formal suit", "dry clean suit", "suits"], gender: ["men", "women"], category: "formal" },
        { id: "dresses_dc", name: "Dresses", emoji: "👰", keywords: ["wedding dress", "evening dress", "dry clean dress", "dresses"], gender: ["women"], category: "formal" },
        { id: "woolens", name: "Woolens", emoji: "🧶", keywords: ["wool", "sweater", "cardigan", "woolen", "dry clean wool", "woolens"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "silks", name: "Silks", emoji: "🦋", keywords: ["silk", "satin", "chiffon", "dry clean silk", "silks"], gender: ["men", "women"], category: "delicate" },
        { id: "leather", name: "Leather", emoji: "🐄", keywords: ["leather", "leather jacket", "dry clean leather"], gender: ["men", "women"], category: "outerwear" },
      ]
    },
    {
      id: "ironing",
      name: "Ironing",
      icon: "fa-fire",
      emoji: "♨️",
      color: "#EC4899",
      gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
      needsFilters: true,
      items: [
        { id: "shirts_iron", name: "Shirts", emoji: "👔", keywords: ["shirt", "formal shirt", "iron shirt", "shirts"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "pants_iron", name: "Pants", emoji: "👖", keywords: ["pant", "trouser", "iron pant", "pants", "trousers"], gender: ["men", "women", "children"], category: "clothing" },
        { id: "dresses_iron", name: "Dresses", emoji: "👗", keywords: ["dress", "evening dress", "iron dress", "dresses"], gender: ["women", "children"], category: "clothing" },
        { id: "bed_linen", name: "Bed Linen", emoji: "🛏️", keywords: ["bed sheet", "pillowcase", "bed linen", "iron bedding"], gender: ["unisex"], category: "home" },
        { id: "table_linen", name: "Table Linen", emoji: "🍽️", keywords: ["tablecloth", "napkin", "table linen", "iron table"], gender: ["unisex"], category: "home" },
      ]
    },
    {
      id: "service_wash",
      name: "Service Wash",
      icon: "fa-soap",
      emoji: "🔄",
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      needsFilters: true,
      items: [
        { id: "clothing_bundle", name: "Clothing Bundle", emoji: "👚", keywords: ["clothing bundle", "bundle", "service wash"], gender: ["men", "women", "children"], category: "bundle" },
        { id: "mixed_bundle", name: "Mixed Bundle", emoji: "📦", keywords: ["mixed bundle", "mixed wash", "service wash"], gender: ["unisex"], category: "bundle" },
      ]
    },
    {
      id: "repair",
      name: "Repair",
      icon: "fa-scissors",
      emoji: "🪡",
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
      needsFilters: true,
      items: [
        { id: "alterations", name: "Alterations", emoji: "✂️", keywords: ["alteration", "resize", "alter", "adjust", "alterations"], gender: ["men", "women", "children"], category: "repair" },
        { id: "repairs", name: "Repairs", emoji: "🪡", keywords: ["repair", "mend", "fix", "repairs", "mending", "stitching"], gender: ["men", "women", "children"], category: "repair" },
        { id: "zippers", name: "Zippers", emoji: "🤐", keywords: ["zipper", "zip repair", "zip", "zippers"], gender: ["men", "women", "children"], category: "repair" },
        { id: "buttons", name: "Buttons", emoji: "🔘", keywords: ["button", "button replacement", "buttons", "sew button"], gender: ["men", "women", "children"], category: "repair" },
      ]
    },
    {
      id: "shoe_cleaning",
      name: "Shoe Cleaning",
      icon: "fa-shoe-prints",
      emoji: "👟",
      color: "#6366F1",
      gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
      needsFilters: true,
      items: [
        { id: "formal_shoes", name: "Formal Shoes", emoji: "👞", keywords: ["formal shoe", "dress shoe", "leather shoe", "formal shoes"], gender: ["men", "women"], category: "footwear" },
        { id: "sneakers", name: "Sneakers", emoji: "👟", keywords: ["sneaker", "trainer", "sports shoe", "sneakers"], gender: ["men", "women", "children"], category: "footwear" },
        { id: "boots", name: "Boots", emoji: "🥾", keywords: ["boot", "hiking boot", "leather boot", "boots"], gender: ["men", "women", "children"], category: "footwear" },
      ]
    }
  ], []);

  const serviceTypes = useMemo(() => [
    { id: "all", name: "All Types", emoji: "📋" },
    { id: "wash", name: "Wash Only", emoji: "🧺" },
    { id: "iron", name: "Iron Only", emoji: "♨️" },
    { id: "wash_iron", name: "Wash & Iron", emoji: "🧺♨️" },
    { id: "dry_clean", name: "Dry Clean", emoji: "🧼" },
    { id: "service_wash", name: "Service Wash", emoji: "🔄" },
    { id: "repair", name: "Repair", emoji: "🪡" },
    { id: "shoe_clean", name: "Shoe Clean", emoji: "👟" },
  ], []);

  const genderOptions = useMemo(() => [
    { id: "all", name: "All Genders", emoji: "👥" },
    { id: "men", name: "Men's", emoji: "👨" },
    { id: "women", name: "Women's", emoji: "👩" },
    { id: "children", name: "Children", emoji: "👶" },
    { id: "unisex", name: "Unisex", emoji: "👕" },
  ], []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("name");
  const [genderFilter, setGenderFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceSlug, itemSlug } = useParams();


  const cleanText = useCallback((text) => {
    if (!text) return '';
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }, []);

  const getProductGender = useCallback((productName) => {
    const cleanName = cleanText(productName);
    
    const childrenKeywords = ["child", "children", "kid", "kids", "baby", "babies", "toddler", "boy", "boys", "girl", "girls"];
    if (childrenKeywords.some(keyword => cleanName.includes(keyword))) {
      return "children";
    }
    
    const menKeywords = ["men", "man", "mens", "man's", "male", "gent", "gents", "menswear", "men's"];
    if (menKeywords.some(keyword => cleanName.includes(keyword))) {
      return "men";
    }
    
    const womenKeywords = ["women", "woman", "womens", "women's", "female", "lady", "ladies", "womenswear"];
    if (womenKeywords.some(keyword => cleanName.includes(keyword))) {
      return "women";
    }
    
    return "unisex";
  }, [cleanText]);

  const getServiceType = useCallback((productName) => {
    const cleanName = cleanText(productName);
    
    if (cleanName.includes("shoe") || cleanName.includes("sneaker") || cleanName.includes("boot")) {
      return "shoe_clean";
    }
    
    if (cleanName.includes("repair") || cleanName.includes("alter") || cleanName.includes("mend") || 
        cleanName.includes("stitch") || cleanName.includes("zip") || cleanName.includes("button")) {
      return "repair";
    }
    
    if (cleanName.includes("bundle") || cleanName.includes("service wash")) {
      return "service_wash";
    }
    
    if ((cleanName.includes("wash") || cleanName.includes("laundry")) && 
        (cleanName.includes("iron") || cleanName.includes("press"))) {
      return "wash_iron";
    }
    
    if (cleanName.includes("dry clean") || cleanName.includes("dryclean") || cleanName.includes("dry")) {
      return "dry_clean";
    }
    
    if (cleanName.includes("wash") || cleanName.includes("laundry")) {
      return "wash";
    }
    
    if (cleanName.includes("iron") || cleanName.includes("press")) {
      return "iron";
    }
    
    return "other";
  }, [cleanText]);

  const categorizeProduct = useCallback((product) => {
    const cleanName = cleanText(product.name);
    const gender = getProductGender(product.name);
    const serviceType = getServiceType(product.name);
    
    let serviceCategory = null;
    let itemCategory = null;
    
    for (const service of services) {
      for (const item of service.items) {
        const hasKeywordMatch = item.keywords.some(keyword => {
          const cleanKeyword = cleanText(keyword);
          if (cleanName.includes(cleanKeyword)) {
            return true;
          }
          const words = cleanName.split(' ');
          const keywordWords = cleanKeyword.split(' ');
          return keywordWords.every(kw => words.includes(kw) || cleanName.includes(kw));
        });
        
        if (hasKeywordMatch) {
          serviceCategory = service.id;
          itemCategory = item.id;
          break;
        }
      }
      if (serviceCategory) break;
    }
    
    return {
      id: product.id,
      name: product.name,
      emoji: product.emoji || "👕",
      price: product.standard_price || product.price || product.offer_price || 0,
      standard_price: product.standard_price || product.price || 0,
      offer_price: product.offer_price || null,
      hasOffer: !!product.offer_price && product.offer_price < product.standard_price,
      cleanName: cleanName,
      gender: gender,
      serviceType: serviceType,
      serviceCategory: serviceCategory,
      itemCategory: itemCategory,
      originalData: product
    };
  }, [cleanText, getProductGender, getServiceType, services]);

  useEffect(() => {
    const savedCart = localStorage.getItem('laundryCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('laundryCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (location.state) {
      const { service, serviceCategory } = location.state;
      if (service) {
        const foundService = services.find(s => 
          cleanText(s.name).includes(cleanText(service)) ||
          service.toLowerCase().includes(cleanText(s.name)) ||
          s.id === serviceCategory
        );
        if (foundService) {
          setSelectedService(foundService);
        }
      }
    }
  }, [location.state, services, cleanText]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/website/products`);
        const data = await response.json();
        
        if (data.success) {
          const formattedProducts = data.data.map(product => 
            categorizeProduct(product)
          );
          
          setProducts(formattedProducts);
        } else {
          console.error("API error:", data);
          // Fallback to mock data
          const mockProducts = [
            { id: "1", name: "Men's Shirt Wash & Iron", price: 12.99 },
            { id: "2", name: "Women's Blouse Dry Clean", price: 15.99 },
            { id: "3", name: "Children's T-Shirt Wash", price: 8.99 },
            { id: "4", name: "Men's Suit Dry Clean", price: 25.99 },
            { id: "5", name: "Women's Dress Wash & Iron", price: 18.99 },
            { id: "6", name: "Children's Jeans Wash", price: 10.99 },
            { id: "7", name: "Bedding Wash", price: 14.99 },
            { id: "8", name: "Men's Jacket Dry Clean", price: 22.99 },
            { id: "9", name: "Women's Silk Blouse Dry Clean", price: 19.99 },
            { id: "10", name: "Children's School Uniform Wash & Iron", price: 13.99 },
            { id: "11", name: "Shoe Cleaning - Formal Shoes", price: 19.99 },
            { id: "12", name: "Sneakers Cleaning", price: 15.99 },
            { id: "13", name: "Boots Cleaning", price: 22.99 },
            { id: "14", name: "Alterations - Men's Pants", price: 12.99 },
            { id: "15", name: "Zipper Repair", price: 8.99 },
            { id: "16", name: "Button Replacement", price: 5.99 },
            { id: "17", name: "Clothing Bundle Service Wash", price: 29.99 },
            { id: "18", name: "Mixed Bundle Service", price: 34.99 },
            { id: "19", name: "Table Linen Ironing", price: 9.99 },
            { id: "20", name: "Bed Linen Ironing", price: 12.99 },
          ].map(product => categorizeProduct(product));
          
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        const mockProducts = [
          { id: "1", name: "Men's Shirt Wash & Iron", price: 12.99 },
          { id: "2", name: "Women's Blouse Dry Clean", price: 15.99 },
          { id: "3", name: "Children's T-Shirt Wash", price: 8.99 },
          { id: "4", name: "Men's Suit Dry Clean", price: 25.99 },
          { id: "5", name: "Women's Dress Wash & Iron", price: 18.99 },
          { id: "6", name: "Children's Jeans Wash", price: 10.99 },
          { id: "7", name: "Bedding Wash", price: 14.99 },
          { id: "8", name: "Men's Jacket Dry Clean", price: 22.99 },
          { id: "9", name: "Women's Silk Blouse Dry Clean", price: 19.99 },
          { id: "10", name: "Children's School Uniform Wash & Iron", price: 13.99 },
          { id: "11", name: "Shoe Cleaning - Formal Shoes", price: 19.99 },
          { id: "12", name: "Sneakers Cleaning", price: 15.99 },
          { id: "13", name: "Boots Cleaning", price: 22.99 },
          { id: "14", name: "Alterations - Men's Pants", price: 12.99 },
          { id: "15", name: "Zipper Repair", price: 8.99 },
          { id: "16", name: "Button Replacement", price: 5.99 },
          { id: "17", name: "Clothing Bundle Service Wash", price: 29.99 },
          { id: "18", name: "Mixed Bundle Service", price: 34.99 },
          { id: "19", name: "Table Linen Ironing", price: 9.99 },
          { id: "20", name: "Bed Linen Ironing", price: 12.99 },
        ].map(product => categorizeProduct(product));
        
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorizeProduct]);

  useEffect(() => {
    let result = [...products];
    
    if (selectedService) {
      if (selectedItem) {
        const keywordPatterns = selectedItem.keywords.map(keyword => 
          new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        );
        
        result = result.filter(product => {
          const matchesKeyword = keywordPatterns.some(pattern => 
            pattern.test(product.name) || pattern.test(product.cleanName)
          );
          
          const matchesCategory = product.itemCategory === selectedItem.id;
          
          return matchesKeyword || matchesCategory;
        });
      } else {
        const allKeywords = selectedService.items.flatMap(item => item.keywords);
        const keywordPatterns = allKeywords.map(keyword => 
          new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        );
        
        result = result.filter(product => {
          const matchesKeyword = keywordPatterns.some(pattern => 
            pattern.test(product.name) || pattern.test(product.cleanName)
          );
          
          const matchesCategory = product.serviceCategory === selectedService.id;
          
          return matchesKeyword || matchesCategory;
        });
      }
    }
    
    if (searchTerm.trim()) {
      const cleanSearch = cleanText(searchTerm);
      result = result.filter(product => {
        return product.cleanName.includes(cleanSearch) ||
               product.originalData?.description?.toLowerCase().includes(cleanSearch) ||
               product.originalData?.tags?.some(tag => 
                 tag.toLowerCase().includes(cleanSearch)
               );
      });
    }
    
    if (genderFilter !== "all") {
      result = result.filter(product => {
        if (genderFilter === "children") {
          return product.gender === "children" || 
                 product.cleanName.includes("child") ||
                 product.cleanName.includes("kid") ||
                 product.cleanName.includes("baby") ||
                 product.cleanName.includes("boy") ||
                 product.cleanName.includes("girl");
        }
        
        if ((genderFilter === "men" || genderFilter === "women") && product.gender === "unisex") {
          if (genderFilter === "men" && product.cleanName.includes("men")) {
            return true;
          }
          if (genderFilter === "women" && product.cleanName.includes("women")) {
            return true;
          }
          return true;
        }
        
        return product.gender === genderFilter;
      });
    }
    
    if (serviceTypeFilter !== "all") {
      result = result.filter(product => {
        if (serviceTypeFilter === "wash_iron") {
          return product.serviceType === "wash_iron" ||
                 (product.cleanName.includes("wash") && 
                  product.cleanName.includes("iron"));
        }
        
        if (serviceTypeFilter === "service_wash") {
          return product.serviceType === "service_wash" ||
                 product.cleanName.includes("bundle") ||
                 product.cleanName.includes("service wash");
        }
        
        if (serviceTypeFilter === "repair") {
          return product.serviceType === "repair" ||
                 product.cleanName.includes("repair") ||
                 product.cleanName.includes("alter") ||
                 product.cleanName.includes("mend");
        }
        
        if (serviceTypeFilter === "shoe_clean") {
          return product.serviceType === "shoe_clean" ||
                 product.cleanName.includes("shoe") ||
                 product.cleanName.includes("sneaker") ||
                 product.cleanName.includes("boot");
        }
        
        return product.serviceType === serviceTypeFilter;
      });
    }
    
    if (activeFilter === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeFilter === "high") {
      result.sort((a, b) => b.price - a.price);
    } else if (activeFilter === "name") {
      const genderOrder = { 
        "men": 1, 
        "women": 2, 
        "children": 3, 
        "unisex": 4 
      };
      result.sort((a, b) => {
        const genderA = genderOrder[a.gender] || 5;
        const genderB = genderOrder[b.gender] || 5;
        if (genderA !== genderB) {
          return genderA - genderB;
        }
        return a.name.localeCompare(b.name);
      });
    }
    
    setFilteredProducts(result);
  }, [products, selectedService, selectedItem, searchTerm, activeFilter, genderFilter, serviceTypeFilter, cleanText]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedItem(null);
    setSearchTerm("");
    setGenderFilter("all");
    setServiceTypeFilter("all");
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSearchTerm("");
    setGenderFilter("all");
    setServiceTypeFilter("all");
  };

  const clearFilters = () => {
    setSelectedService(null);
    setSelectedItem(null);
    setSearchTerm("");
    setActiveFilter("name");
    setGenderFilter("all");
    setServiceTypeFilter("all");
  };

  const getPriceDisplay = (product) => {
    const standardPrice = `£${Number(product.standard_price || product.price).toFixed(2)}`;
    const offerPrice = product.hasOffer ? `£${Number(product.offer_price).toFixed(2)}` : null;
    return { standardPrice, offerPrice };
  };

  const getServiceTypeDisplay = (serviceType, productName) => {
    const cleanName = cleanText(productName);
    
    switch(serviceType) {
      case "wash_iron":
      case "wash_iron": return "Wash & Iron";
      case "wash": return "Wash Only";
      case "iron": return "Iron Only";
      case "dry_clean": return "Dry Clean";
      case "service_wash": return "Service Wash";
      case "repair": return "Repair";
      case "shoe_clean": return "Shoe Cleaning";
      default:
        if (cleanName.includes("wash") && cleanName.includes("iron")) return "Wash & Iron";
        if (cleanName.includes("wash")) return "Wash Only";
        if (cleanName.includes("iron")) return "Iron Only";
        if (cleanName.includes("dry clean")) return "Dry Clean";
        if (cleanName.includes("bundle")) return "Service Wash";
        if (cleanName.includes("repair") || cleanName.includes("alter")) return "Repair";
        if (cleanName.includes("shoe")) return "Shoe Cleaning";
        return "Standard Service";
    }
  };

  const getGenderDisplay = (gender, productName) => {
    const cleanName = cleanText(productName);
    
    if (cleanName.includes("men") || gender === "men") return "Men's";
    if (cleanName.includes("women") || gender === "women") return "Women's";
    if (cleanName.includes("child") || cleanName.includes("kid") || cleanName.includes("baby") || 
        cleanName.includes("boy") || cleanName.includes("girl") || gender === "children") return "Children's";
    if (gender === "unisex") return "Unisex";
    return "Standard";
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          ...product,
          quantity: 1,
          price: product.price
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== productId);
      } else {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout", { state: { cart } });
  };

  const formatPrice = (price) => {
    return `£${Number(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="service-pricing-loading">
        <div className="loading-spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="service-pricing-container">
      
      {/* Header */}
      <div className="service-pricing-header">
        <button 
          className="back-to-home"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="header-main">
          <div className="header-badge">
            <i className="fas fa-pound-sign"></i>
            <span>Transparent Pricing</span>
          </div>
          <h1 style={{color:"#1a1a1a"}}>Service Pricing</h1>
          <p className="header-subtitle" style={{color:"#4a5568"}}>
            Clear, upfront pricing for all our premium laundry services
          </p>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="fas fa-search"></i>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={clearFilters} className={!selectedService ? 'active' : ''}style={{color:"#4a5568"}}>
          All Services
        </button>
        {selectedService && (
          <>
            <i className="fas fa-chevron-right"></i>
            <button 
              onClick={() => setSelectedItem(null)} 
              className={!selectedItem ? 'active' : ''}
            >
              {selectedService.name}
            </button>
          </>
        )}
        {selectedItem && (
          <>
            <i className="fas fa-chevron-right"></i>
            <span className="current" style={{color:"#1a1a1a"}}>{selectedItem.name}</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="service-pricing-content">
        
        {/* Service Categories - Card Style */}
        {!selectedService && (
          <div className="services-selection">
            <h2 style={{color:"#1a1a1a"}}>Choose a Service</h2>
            <p className="selection-subtitle"style={{color:"#4a5568"}}>Select from our professional laundry services</p>
            <div className="services-cards">
              {services.map(service => (
                <div
                  key={service.id}
                  className="service-selection-card"
                  onClick={() => handleServiceSelect(service)}
                  style={{ '--service-color': service.color }}
                >
                  <div className="selection-card-icon" style={{ background: service.gradient }}>
                    <i className={`fas ${service.icon}`}></i>
                  </div>
                  <h3>{service.name}</h3>
                  <div className="selection-card-items">
                    {service.items.slice(0, 3).map((item, index) => (
                      <span key={index} className="selection-item-tag">{item.emoji} {item.name}</span>
                    ))}
                    {service.items.length > 3 && (
                      <span className="selection-more-tag">+{service.items.length - 3} more</span>
                    )}
                  </div>
                  <div className="selection-card-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Items - Beautiful Card Style with Large Emoji */}
        {selectedService && !selectedItem && selectedService.needsFilters && (
          <div className="service-items-selection">
            <div className="selection-header">
              <button className="back-button" onClick={clearFilters}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <h2 style={{color:"#1a1a1a"}}>{selectedService.name}</h2>
            </div>
            <p className="selection-subtitle" style={{color:"#4a5568"}}>Select what you need cleaned</p>
            
            <div className="items-selection-grid">
              {selectedService.items.map(item => (
                <div
                  key={item.id}
                  className="item-selection-card"
                  onClick={() => handleItemSelect(item)}
                  style={{ '--item-color': selectedService.color }}
                >
                  <div className="item-emoji-large">{item.emoji}</div>
                  <div className="item-card-content">
                    <h4 style={{color:"#1a1a1a"}}>{item.name}</h4>
                    <div className="item-gender-tags">
                      {item.gender.includes("men") && <span className="gender-tag men">Men</span>}
                      {item.gender.includes("women") && <span className="gender-tag women">Women</span>}
                      {item.gender.includes("children") && <span className="gender-tag children">Children</span>}
                      {item.gender.includes("unisex") && <span className="gender-tag unisex">Unisex</span>}
                    </div>
                  </div>
                  <div className="item-card-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products List - Todo List Style */}
        {(selectedItem || (selectedService && !selectedService.needsFilters)) && (
          <div className="products-todo-section">
            <div className="todo-section-header">
              <button className="back-button" onClick={() => selectedItem ? setSelectedItem(null) : clearFilters()}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <h2 style={{color:"#4a5568"}}>{selectedItem ? selectedItem.name : selectedService.name}</h2>
            </div>

            {/* Filters */}
            <div className="todo-filters">
              <div className="filter-group" style={{color:"#1a1ala"}}>
                <label style={{color:"#4a5568"}}>Gender:</label>
                <select 
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="filter-select" style={{color:"#1a1a1a"}}
                >
                  {genderOptions.map(gender => (
                    <option key={gender.id} value={gender.id} style={{color:"#1a1a1a"}}>
                      {gender.emoji} {gender.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group" style={{color:"#1a1a1a"}}>
                <label style={{color:"#4a5568"}}>Service Type:</label>
                <select 
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="filter-select" style={{color:"#1a1a1a"}}
                >
                  {serviceTypes.map(type => (
                    <option key={type.id} value={type.id} style={{color:"#1a1a1a"}}>
                      {type.emoji} {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by:</label>
                <select 
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="filter-select" style={{color:"#1a1a1a"}}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Todo List */}
            {filteredProducts.length > 0 ? (
              <div className="todo-list">
                {filteredProducts.map(product => {
                  const { standardPrice, offerPrice } = getPriceDisplay(product);
                  const serviceType = getServiceTypeDisplay(product.serviceType, product.name);
                  const genderDisplay = getGenderDisplay(product.gender, product.name);
                  const isInCart = cart.find(item => item.id === product.id);
                  const cartQuantity = isInCart ? isInCart.quantity : 0;
                  
                  return (
                    <div key={product.id} className="todo-item" style={{color:"#1a1a1"}}>
                      <div className="todo-item-left">
                        {/* <div className="todo-checkbox">
                          <div className="checkbox"></div>
                        </div> */}
                        <span className="todo-emoji">{product.emoji}</span>
                        <div className="todo-content">
                          <h4 style={{color:"#1a1a1a"}}>{product.name}</h4>
                          <div className="todo-meta">
                            <span className="todo-service-type">{serviceType}</span>
                            <span className="todo-gender">{genderDisplay}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="todo-item-right">
                        <div className="todo-pricing" style={{color:"#1alala"}}>
                          {/* {product.hasOffer ? (
                            <div className="todo-price-offer">
                              <span className="todo-price-original" style={{color:"#1a1a1a"}}>{standardPrice}</span>
                              <span className="todo-price-current" style={{color:"#1a1a1a"}}>{offerPrice}</span>
                            </div>
                          ) : ( */}
                            <span className="todo-price-single" style={{color:"#1a1a1a"}}>{standardPrice}</span>
                          
                        </div>
                        
                        <div className="todo-actions">
                          {cartQuantity > 0 ? (
                            <div className="todo-quantity-control">
                              <button 
                                className="todo-qty-btn minus"
                                onClick={() => removeFromCart(product.id)}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <span className="todo-qty-display">{cartQuantity}</span>
                              <button 
                                className="todo-qty-btn plus"
                                onClick={() => addToCart(product)}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="todo-add-btn"
                              onClick={() => addToCart(product)}
                            >
                              <i className="fas fa-plus"></i> Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>No services found</h3>
                <p>Try adjusting your filters or search term</p>
                <button 
                  className="reset-filters-btn"
                  onClick={() => {
                    setGenderFilter("all");
                    setServiceTypeFilter("all");
                    setSearchTerm("");
                  }}
                >
                  <i className="fas fa-redo"></i> Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Summary - Simple & User Friendly */}
      {cart.length > 0 && (
        <div className={`cart-summary ${showCart ? 'expanded' : ''}`}>
          <div className="cart-summary-top" onClick={() => setShowCart(!showCart)}>
            <div className="cart-info">
              <div className="cart-icon-wrapper">
                <i className="fas fa-shopping-bag"></i>
                <span className="cart-count" style={{color:"#1a1a1a"}}>{getCartItemCount()}</span>
              </div>
              <div className="cart-details">
                <span className="cart-items-text" style={{color:"#1a1a1a"}}>{getCartItemCount()} items</span>
                <span className="cart-total-text" style={{color:"#1a1a1a"}}>{formatPrice(getCartTotal())}</span>
              </div>
            </div>
            <i className={`fas fa-chevron-${showCart ? 'up' : 'down'}`}></i>
          </div>
          
          {showCart && (
            <div className="cart-summary-content">
              <div className="cart-items" style={{color:"#1a1a1a"}}>
                <h4 style={{color:"#1a1a1a"}}>Your Cart</h4>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-left">
                      <span className="cart-item-emoji">{item.emoji || "👕"}</span>
                      <div className="cart-item-info">
                        <h5 style={{color:"#1a1a1a"}}>{item.name}</h5>
                        <span className="cart-item-price" style={{color:"#1a1a1a"}}>{formatPrice(item.price)} each</span>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <div className="cart-item-controls">
                        <button 
                          className="cart-qty-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="cart-qty">{item.quantity}</span>
                        <button 
                          className="cart-qty-btn"
                          onClick={() => addToCart(item)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <span className="cart-item-total" style={{color:"#1a1a1a"}}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary-bottom">
                <div className="cart-total-section">
                  <span style={{color:"#1a1a1a"}}>Subtotal</span>
                  <span className="cart-final-total" style={{color:"#1a1a1a"}}>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="cart-actions">
                  <button className="cart-clear-btn" onClick={clearCart} style={{border:" 1px solid #e2e8f0",color:"#4a5568"}}>
                    Clear Cart
                  </button>
                  <button className="cart-checkout-btn" onClick={handleProceedToCheckout}>
                    Checkout <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Booking CTA */}
      {cart.length === 0 && (
        <div className="quick-booking-cta">
          <div className="cta-content">
            <div className="cta-badge">
              <i className="fas fa-bolt"></i>
              <span>Quick Booking</span>
            </div>
            <h3 style={{color:"#1a1a1a"}}>Need help selecting services?</h3>
            <p style={{color:"#4a5568"}}>Book a pickup directly with our assistance</p>
            <button 
              className="quick-book-btn"
              onClick={() => navigate("/quick-booking")}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Quick Booking</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePricing;