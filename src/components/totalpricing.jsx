import React, { useEffect, useState } from "react";
import "./totalpricing.css";
//<<<<<<< HEAD
   const serviceData = {
      "Clean and Iron": [
    { name: "Mens Shirt on Hanger", price: "£2.80", code: "CI001" },
    { name: "Mens Shirt Folded", price: "£3.55", code: "CI002" },
    { name: "Ladies Shirt on Hanger", price: "£5.00", code: "CI003" },
    { name: "Ladies Shirt Folded", price: "£6.00", code: "CI004" },
    { name: "Dress Shirt on Hanger", price: "£4.95", code: "CI005" },
    { name: "Child's Shirt: Hanger", price: "£1.82", code: "CI006" },
    { name: "Child's Shirt: Folded", price: "£6.00", code: "CI007" },
    { name: "Child's Dress Shirt", price: "£3.21", code: "CI008" },
    { name: "2 Piece Suit", price: "£15.00", code: "CI009" },
    { name: "3 Piece Suit", price: "£20.60", code: "CI010" },
    { name: "Dress", price: "£12.80", code: "CI011" },
    { name: "Dress (Evening/Delicate)", price: "£22.85", code: "CI012" },
    { name: "Jumpsuit", price: "£14.45", code: "CI013" },
    { name: "Pyjamas", price: "£8.95", code: "CI014" },
    { name: "Wedding Dress (Starting from)", price: "£162.05", code: "CI015" },
    { name: "Child's 2 Piece Suit", price: "£9.75", code: "CI016" },
    { name: "Child's 3 Piece Suit", price: "£13.38", code: "CI017" },
    { name: "Child's Dress", price: "£8.36", code: "CI018" },
    { name: "Child's Dress (Evening/Delicate)", price: "£14.69", code: "CI019" },
    { name: "Child's Jumpsuit", price: "£9.38", code: "CI020" },
    { name: "Child's Pyjamas", price: "£5.64", code: "CI021" },
    { name: "Blouse", price: "£6.65", code: "CI022" },
    { name: "Coat", price: "£17.75", code: "CI023" },
    { name: "Jacket", price: "£9.50", code: "CI024" },
    { name: "Jacket (Puffer)", price: "£25.88", code: "CI025" },
    { name: "Jacket (Burberry, Canada Goose)", price: "£57.20", code: "CI026" },
    { name: "Jumper", price: "£7.95", code: "CI027" },
    { name: "Knitwear", price: "£7.95", code: "CI028" },
    { name: "Knitwear (Cashmere)", price: "£10.00", code: "CI029" },
    { name: "Polo Shirt", price: "£4.35", code: "CI030" },
    { name: "T-Shirt", price: "£4.35", code: "CI031" },
    { name: "Top", price: "£7.25", code: "CI032" },
    { name: "Top (Silk/Beads)", price: "£10.50", code: "CI033" },
    { name: "Tie", price: "£6.25", code: "CI034" },
    { name: "Scarf", price: "£6.15", code: "CI035" },
    { name: "Child's Blouse", price: "£4.32", code: "CI036" },
    { name: "Child's Coat", price: "£11.53", code: "CI037" },
    { name: "Child's Jacket", price: "£6.24", code: "CI038" },
    { name: "Child's Jacket (Puffer)", price: "£16.56", code: "CI039" },
    { name: "Child's Jumper", price: "£5.17", code: "CI040" },
    { name: "Child's Knitwear", price: "£5.17", code: "CI041" },
    { name: "Child's Knitwear (Cashmere)", price: "£6.47", code: "CI042" },
    { name: "Child's Polo Shirt", price: "£2.83", code: "CI043" },
    { name: "Child's T-Shirt", price: "£2.83", code: "CI044" },
    { name: "Child's Top", price: "£4.72", code: "CI045" },
    { name: "Child's Top (Silk/Beads)", price: "£6.77", code: "CI046" },
    { name: "Jeans", price: "£6.90", code: "CI047" },
    { name: "Shorts", price: "£5.50", code: "CI048" },
    { name: "Skirt", price: "£7.75", code: "CI049" },
    { name: "Socks", price: "£1.20", code: "CI050" },
    { name: "Trousers", price: "£6.90", code: "CI051" },
    { name: "Underwear", price: "£1.20", code: "CI052" },
    { name: "Child's Jeans", price: "£4.50", code: "CI053" },
    { name: "Child's Shorts", price: "£3.58", code: "CI054" },
    { name: "Child's Skirt", price: "£5.03", code: "CI055" },
    { name: "Child's Trousers", price: "£4.50", code: "CI056" }
  ],}
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

