import React, { useEffect, useState } from "react";
import "./totalpricing.css";
//<<<<<<< HEAD
//=======
//>>>>>>> f7e627f (Upadte ibltd page with atteched backend connection)

const API_BASE = "https://api.ironingboy.com";

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
          categoryNames.push(c.name);
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

          grouped[categoryName].push({
            name: p.name,
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

