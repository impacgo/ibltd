
import React, { useState } from "react";
import "./totalpricing.css";
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
    { name: "Jacket (Burberry, Canada Goose or Moncler)", price: "£57.20", code: "CI026" },
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
  ],

  "Iron Only": [
    { name: "Mens Shirt: Hanger - Iron Only", price: "£2.80", code: "IO001" },
    { name: "Mens Shirt: Folded - Iron Only", price: "£3.55", code: "IO002" },
    { name: "Ladies Shirt: Hanger - Iron Only", price: "£4.00", code: "IO003" },
    { name: "Ladies Shirt: Folded - Iron Only", price: "£4.79", code: "IO004" },
    { name: "Dress Shirt - Iron Only", price: "£3.96", code: "IO005" },
    { name: "Child's Shirt: Hanger - Iron Only", price: "£1.82", code: "IO006" },
    { name: "Child's Shirt: Folded - Iron Only", price: "£2.29", code: "IO007" },
    { name: "2 Piece Suit - Iron Only", price: "£12.02", code: "IO008" },
    { name: "3 Piece Suit - Iron Only", price: "£16.50", code: "IO009" },
    { name: "Dress - Iron Only", price: "£9.81", code: "IO010" },
    { name: "Dress (Evening/Delicate) - Iron Only", price: "£18.22", code: "IO011" },
    { name: "Jumpsuit - Iron Only", price: "£11.57", code: "IO012" },
    { name: "Pyjamas - Iron Only", price: "£7.07", code: "IO013" },
    { name: "Blouse - Iron Only", price: "£5.33", code: "IO014" },
    { name: "Jacket - Iron Only", price: "£7.65", code: "IO015" },
    { name: "Jumper - Iron Only", price: "£6.37", code: "IO016" },
    { name: "Knitwear - Iron Only", price: "£6.37", code: "IO017" },
    { name: "Knitwear (Cashmere) - Iron Only", price: "£7.99", code: "IO018" },
    { name: "Polo Shirt - Iron Only", price: "£3.49", code: "IO019" },
    { name: "Scarf - Iron Only", price: "£4.86", code: "IO020" },
    { name: "T-Shirt - Iron Only", price: "£3.49", code: "IO021" },
    { name: "Top - Iron Only", price: "£5.81", code: "IO022" },
    { name: "Top (Silk/Beads) - Iron Only", price: "£8.38", code: "IO023" },
    { name: "Tie - Iron Only", price: "£5.01", code: "IO024" },
    { name: "Jeans - Iron Only", price: "£5.54", code: "IO025" },
    { name: "Shorts - Iron Only", price: "£4.41", code: "IO026" },
    { name: "Skirt - Iron Only", price: "£6.21", code: "IO027" },
    { name: "Trousers - Iron Only", price: "£5.54", code: "IO028" },
    { name: "Underwear - Iron Only", price: "£0.95", code: "IO029" }
  ],
    "Dry Clean": [
    { name: "Shirt on Hanger - Dry Clean", price: "£5.55", code: "DC001" },
    { name: "Shirt Folded - Dry Clean", price: "£6.40", code: "DC002" }
  ],

  "Leather, Fur, Suede": [
    { name: "Coat (Fur)", price: "£94.75", code: "LFS001" },
    { name: "Coat (Leather/Suede)", price: "£83.69", code: "LFS002" },
    { name: "Coat (Leather Trim)", price: "£51.35", code: "LFS003" },
    { name: "Dress (Leather)", price: "£69.50", code: "LFS004" },
    { name: "Gloves (Leather)", price: "£43.60", code: "LFS005" },
    { name: "Jacket (Fur)", price: "£83.50", code: "LFS006" },
    { name: "Jacket (Leather/Suede)", price: "£72.35", code: "LFS007" },
    { name: "Jacket (Leather Trim)", price: "£28.46", code: "LFS008" },
    { name: "Skirt (Leather)", price: "£72.32", code: "LFS009" },
    { name: "Trousers (Leather)", price: "£58.30", code: "LFS010" },
    { name: "Trousers (Leather Trim)", price: "£19.90", code: "LFS011" },
    { name: "Child's Coat (Leather/Suede)", price: "£53.08", code: "LFS012" },
    { name: "Child's Dress (Leather)", price: "£65.06", code: "LFS013" },
    { name: "Child's Jacket (Leather/Suede)", price: "£45.84", code: "LFS014" }
  ],

  "Service Wash Per Load": [
    { name: "Wash Dry & Fold Up to 5 kg", price: "£18.85", code: "SW001" },
    { name: "Per Additional Kg", price: "£3.75", code: "SW002" }
  ],

  "Bedding & Household (Clean & Iron)": [
    { name: "Bed Set: Single", price: "£15.60", code: "BH001" },
    { name: "Bed Set: Double", price: "£18.35", code: "BH002" },
    { name: "Bed Set: King", price: "£20.65", code: "BH003" },
    { name: "Bed Set: Super King", price: "£23.95", code: "BH004" },
    { name: "Blanket", price: "£14.35", code: "BH005" },
    { name: "Blanket (Large)", price: "£22.80", code: "BH006" },
    { name: "Duvet Cover: Single", price: "£9.45", code: "BH007" },
    { name: "Duvet Cover: Double", price: "£10.95", code: "BH008" },
    { name: "Duvet Cover: King", price: "£11.45", code: "BH009" },
    { name: "Duvet Cover: Super King", price: "£12.80", code: "BH010" },
    { name: "Pillowcase", price: "£2.35", code: "BH011" },
    { name: "Sheet: Single", price: "£5.50", code: "BH012" },
    { name: "Sheet: Double", price: "£7.25", code: "BH013" },
    { name: "Sheet: King", price: "£7.70", code: "BH014" },
    { name: "Sheet: Super King", price: "£8.85", code: "BH015" },
    { name: "Silk Bed Set: Single", price: "£21.24", code: "BH016" },
    { name: "Silk Bed Set: Double", price: "£25.09", code: "BH017" },
    { name: "Silk Bed Set: King", price: "£28.31", code: "BH018" },
    { name: "Silk Bed Set: Super King", price: "£32.93", code: "BH019" },
    { name: "Silk Blanket", price: "£19.49", code: "BH020" },
    { name: "Silk Blanket (Large)", price: "£31.32", code: "BH021" },
    { name: "Silk Duvet Cover: Single", price: "£12.91", code: "BH022" },
    { name: "Silk Duvet Cover: Double", price: "£15.01", code: "BH023" },
    { name: "Silk Duvet Cover: King", price: "£15.71", code: "BH024" },
    { name: "Silk Duvet Cover: Super King", price: "£17.60", code: "BH025" },
    { name: "Feather Duvet: Single", price: "£21.78", code: "BH026" },
    { name: "Feather Duvet: Double", price: "£28.44", code: "BH027" },
    { name: "Feather Duvet: King", price: "£30.24", code: "BH028" },
    { name: "Feather Duvet: Super King", price: "£33.12", code: "BH029" },
    { name: "Feather Pillow", price: "£14.00", code: "BH030" },
    { name: "Blinds - per m²", price: "£5.10", code: "BH031" },
    { name: "Curtains (Net) - per m²", price: "£3.75", code: "BH032" },
    { name: "Curtains (Non-lined) - per m²", price: "£5.65", code: "BH033" },
    { name: "Curtains (Medium-lined) - per m²", price: "£7.25", code: "BH034" },
    { name: "Curtains (Heavy-lined) - per m²", price: "£8.85", code: "BH035" },
    { name: "Curtains (Blackout) - per m²", price: "£16.15", code: "BH036" },
    { name: "Bath Mat", price: "£5.40", code: "BH037" },
    { name: "Mat", price: "£6.25", code: "BH038" },
    { name: "Towel (Tea)", price: "£0.65", code: "BH039" },
    { name: "Towel (Hand)", price: "£1.25", code: "BH040" },
    { name: "Towel (up to 1.5m)", price: "£1.85", code: "BH041" },
    { name: "Towel (more than 1.5m)", price: "£3.65", code: "BH042" },
    { name: "Bath Robe", price: "£7.30", code: "BH043" },
    { name: "Cushion", price: "£6.25", code: "BH044" },
    { name: "Cushion (Large)", price: "£9.40", code: "BH045" },
    { name: "Cushion Cover", price: "£6.25", code: "BH046" },
    { name: "Cushion Cover (Large)", price: "£9.40", code: "BH047" },
    { name: "Napkin", price: "£1.15", code: "BH048" },
    { name: "Table Cloth", price: "£8.10", code: "BH049" },
    { name: "Table Cloth (Large)", price: "£24.55", code: "BH050" },
    { name: "Table Mat", price: "£3.55", code: "BH051" },
    { name: "Table Runner", price: "£15.60", code: "BH052" }
  ],

  "Bedding (Iron Only)": [
    { name: "Pillowcase - Iron Only", price: "£1.90", code: "BIO001" },
    { name: "Duvet Cover: Single - Iron Only", price: "£7.63", code: "BIO002" },
    { name: "Duvet Cover: Double - Iron Only", price: "£8.82", code: "BIO003" },
    { name: "Duvet Cover: King - Iron Only", price: "£9.21", code: "BIO004" },
    { name: "Duvet Cover: Super King - Iron Only", price: "£10.28", code: "BIO005" },
    { name: "Sheet: Single - Iron Only", price: "£4.45", code: "BIO006" },
    { name: "Sheet: Double - Iron Only", price: "£5.83", code: "BIO007" },
    { name: "Sheet: King - Iron Only", price: "£6.19", code: "BIO008" },
    { name: "Sheet: Super King - Iron Only", price: "£7.10", code: "BIO009" },
    { name: "Towel (Tea) - Iron Only", price: "£0.52", code: "BIO010" },
    { name: "Towel (Hand) - Iron Only", price: "£1.00", code: "BIO011" },
    { name: "Towel (up to 1.5m) - Iron Only", price: "£1.47", code: "BIO012" },
    { name: "Towel (more than 1.5m) - Iron Only", price: "£2.89", code: "BIO013" },
    { name: "Napkin - Iron Only", price: "£0.92", code: "BIO014" },
    { name: "Bath Robe - Iron Only", price: "£6.04", code: "BIO015" },
    { name: "Cushion Cover - Iron Only", price: "£4.94", code: "BIO016" },
    { name: "Cushion Cover (Large) - Iron Only", price: "£7.43", code: "BIO017" },
    { name: "Table Cloth - Iron Only", price: "£6.45", code: "BIO018" },
    { name: "Table Cloth (Large) - Iron Only", price: "£19.44", code: "BIO019" }
  ],

  
  
  "Bag and Footwear": [
    { name: "Handbag", price: "£83.50", code: "BF001" },
    { name: "Shoes", price: "£17.75", code: "BF002" },
    { name: "Trainers", price: "£24.30", code: "BF003" },
    { name: "UGG Boots", price: "£72.35", code: "BF004" },
    { name: "Boots", price: "£23.95", code: "BF005" }
  ],

  "Repair & Alterations": [
    { name: "Button Repair", price: "£4.15", code: "RA001" },
    { name: "New Zip (0\" to 10\")", price: "£25.75", code: "RA002" },
    { name: "New Zip (10\" to 30\")", price: "£40.90", code: "RA003" },
    { name: "New Zip (30\"+)", price: "£59.35", code: "RA004" },
    { name: "Patch Repair", price: "£20.85", code: "RA005" },
    { name: "Repair/Alteration", price: "£16.65", code: "RA006" },
    { name: "Small Repair", price: "£8.95", code: "RA007" },
    { name: "Curtains Shortening: per m*", price: "£22.15", code: "RA008" },
    { name: "Dress Shortening", price: "£26.45", code: "RA009" },
    { name: "Dress Shortening (Pleated/Multiple Layers)", price: "£46.95", code: "RA010" },
    { name: "Name Tags", price: "£3.55", code: "RA011" },
    { name: "Skirt Shortening", price: "£26.50", code: "RA012" },
    { name: "Skirt Shortening (Pleated/Multiple Layers)", price: "£61.84", code: "RA013" },
    { name: "Sleeve Lengthening", price: "£37.15", code: "RA014" },
    { name: "Sleeve Shortening", price: "£37.15", code: "RA015" },
    { name: "Tapering", price: "£40.15", code: "RA016" },
    { name: "Top Shortening", price: "£19.75", code: "RA017" },
    { name: "Trousers Re-hem (1 leg)", price: "£9.85", code: "RA018" },
    { name: "Trousers Lengthening", price: "£24.10", code: "RA019" },
    { name: "Trousers Shortening", price: "£20.95", code: "RA020" },
    { name: "Waist In/Out", price: "£24.85", code: "RA021" },
    { name: "Leather Half Sole", price: "£42.00", code: "RA022" },
    { name: "Leather Half Sole & Heel", price: "£73.35", code: "RA023" },
    { name: "Rubber Half Sole", price: "£29.25", code: "RA024" },
    { name: "Rubber Half Sole & Heel", price: "£49.75", code: "RA025" },
    { name: "Rubber Heel", price: "£17.10", code: "RA026" },
    { name: "Shoe Shine", price: "£18.40", code: "RA027" },
    { name: "Shoe Tips", price: "£20.90", code: "RA028" }
  ],
  
};

/* Extract category names */
const categories = Object.keys(serviceData);

const TotalPricing = () => {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (category) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <section className="tp-page">
      <div className="tp-container">

        {/* HEADER */}
        <header className="tp-header">
          <span className="tp-badge">Complete Price List</span>
          <h1 className="tp-title">Explore Our Services & Pricing</h1>
          <p className="tp-subtitle">
            Tap any category to view the full list of services with accurate pricing.
          </p>
        </header>

        {/* CATEGORY CARDS */}
        <div className="tp-accordion">
          {categories.map((category) => (
            <div key={category} className="tp-accordion-item">
              
              {/* CATEGORY HEADER */}
              <button
                className={`tp-accordion-header ${
                  openCategory === category ? "open" : ""
                }`}
                onClick={() => toggleCategory(category)}
              >
                <span>{category}</span>
                <i
                  className={`fas fa-chevron-down arrow ${
                    openCategory === category ? "rotate" : ""
                  }`}
                ></i>
              </button>

              {/* CONTENT */}
              <div
                className={`tp-accordion-content ${
                  openCategory === category ? "show" : ""
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
                      {serviceData[category].map((s, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{s.name}</td>
                          <td>{s.price}</td>
                        </tr>
                      ))}
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
