import React, { useEffect, useState } from "react";
import "./totalpricing.css";

const API_BASE = "https://api.ironingboy.com";

// Function to convert text to camel case (Title Case)
const toCamelCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase() // First convert to lowercase
    .split(' ') // Split by spaces
    .map(word => {
      // Handle special cases like hyphens, slashes, colons
      if (word.includes('-')) {
        return word
          .split('-')
          .map(subWord => subWord.charAt(0).toUpperCase() + subWord.slice(1))
          .join('-');
      }
      if (word.includes('/')) {
        return word
          .split('/')
          .map(subWord => subWord.charAt(0).toUpperCase() + subWord.slice(1))
          .join('/');
      }
      if (word.includes(':')) {
        return word
          .split(':')
          .map((subWord, idx) => {
            if (idx === 0) {
              return subWord.charAt(0).toUpperCase() + subWord.slice(1);
            }
            return subWord;
          })
          .join(':');
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
};

// Alternative simpler function for proper title case
const toProperCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Convert to lowercase first
  let result = text.toLowerCase();
  
  // Capitalize first letter of each word
  result = result.replace(/\b\w/g, char => char.toUpperCase());
  
  // Handle special words that should remain lowercase (like 'and', 'or', 'the', etc.)
  const smallWords = ['and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'by'];
  
  // Split into words, apply small word rules
  const words = result.split(' ');
  const processedWords = words.map((word, index) => {
    // Keep small words lowercase except first word
    if (index > 0 && smallWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word;
  });
  
  return processedWords.join(' ');
};

// Function specifically for laundry service names
const formatServiceName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Common laundry terms that should remain as-is
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
  
  // Convert to lowercase for processing
  let formatted = name.toLowerCase();
  
  // Replace common laundry terms with proper casing
  Object.entries(laundryTerms).forEach(([lower, proper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    formatted = formatted.replace(regex, proper);
  });
  
  // Capitalize first letter of each word (for any remaining words)
  formatted = formatted
    .split(' ')
    .map(word => {
      // If word already has proper casing (from laundryTerms), leave it
      if (Object.values(laundryTerms).includes(word)) {
        return word;
      }
      // Capitalize first letter of each remaining word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  // Clean up multiple spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();
  
  return formatted;
};

const TotalPricing = () => {
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [loading, setLoading] = useState(true);

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

        // convert array → map id → category name
        const tempCatMap = {};
        const categoryNames = [];

        catList.forEach((c) => {
          tempCatMap[c.id] = c.name;
          // Format category names as well
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
          if (!categoryName) return; // skip invalid categories

          const priceValue = p.price ?? p.standard_price ?? 0;
          const formattedCategory = formatServiceName(categoryName);
          const formattedName = formatServiceName(p.name);

          grouped[formattedCategory].push({
            name: formattedName,
            price: "£" + Number(priceValue).toFixed(2),
          });
        });

        setCategories(categoryNames);
        setCategoryMap(grouped);

      } catch (err) {
        console.error("Pricing Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="tp-page">
        <div className="tp-container">
          <h2 style={{ textAlign: "center", padding: "40px" }}>
            Loading pricing…
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-page">
      <div className="tp-container">
        
        {/* Header */}
        <header className="tp-header">
          <span className="tp-badge">Complete Price List</span>
          <h1 className="tp-title">Explore Our Services & Pricing</h1>
          <p className="tp-subtitle">
            Tap any category to view the full list of services with accurate pricing.
          </p>
        </header>

        {/* Accordion */}
        <div className="tp-accordion">
          {categories.map((cat) => (
            <div key={cat} className="tp-accordion-item">

              {/* Category Header */}
              <button
                className={`tp-accordion-header ${openCategory === cat ? "open" : ""}`}
                onClick={() => toggleCategory(cat)}
              >
                <span>{cat}</span>
                <i
                  className={`fas fa-chevron-down arrow ${
                    openCategory === cat ? "rotate" : ""
                  }`}
                ></i>
              </button>

              {/* Category Contents */}
              <div
                className={`tp-accordion-content ${
                  openCategory === cat ? "show" : ""
                }`}
              >
                <div className="tp-table-wrapper">
                  <table className="tp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Service</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryMap[cat] && categoryMap[cat].length > 0 ? (
                        categoryMap[cat].map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center" }}>
                            No services available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TotalPricing;