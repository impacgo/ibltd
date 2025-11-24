// src/components/Pricing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Pricing.css";

const pricingData = [
  {
    category: "Full Body & Essentials",
    items: [
      { name: "Mens Shirt on Hanger", price: "£2.80", code: "CI001" },
      { name: "Mens Shirt Folded", price: "£3.55", code: "SH002" },
      { name: "Ladies Shirt on Hanger", price: "£5.00", code: "CI003" },
      { name: "Socks: Wash & Press - Folded", price: "£1.20" },
      { name: "Ladies Shirt on Hanger", price: "£5.00", code: "SH003" },
      { name: "Underwear: Press Only - Folded", price: "£0.95" },
      { name: "Face Mask: Wash & Press", price: "£1.90" },
      { name: "Child's Dress Shirt", price: "£3.21", code: "CI008" },
      { name: "BraL Wash & Press - Folded", price: "£2.45" },
    ],
  },
  {
    category: "Household Extras",
    items: [
      { name: "Pillowcase", price: "£2.35", code: "BH011" },
      { name: "Toy: Wash & Press", price: "£5.25" },
      { name: "Sheet: Single", price: "£5.50", code: "BH012" },
      { name: "Toy: Dry Clean", price: "£5.25" },
      { name: "Silk Duvet Cover: Single", price: "£12.91", code: "BH022" },
      { name: "Blinds - per m²", price: "£5.10", code: "BH031" },
      { name: "Towel (up to 1.5m)", price: "£1.85", code: "BH041" },
      { name: "Toy: Large - Wash & Press", price: "£7.88" },
    ],
  },
  {
    category: "Accessories",
    items: [
      { name: "Belt (Free)", price: "£0.00", code: "AC001" },
  { name: "Bow Tie: Dry Clean", price: "£3.55", code: "AC002" },
  { name: "Scarf: Press Only - Hanger", price: "£4.86", code: "AC003" },
  { name: "Tie: Press Only - Hanger", price: "£5.01", code: "AC004" },
  { name: "Slippers", price: "£4.10", code: "AC005" },
  { name: "Cap / Hat (Press Only)", price: "£3.25", code: "AC006" },
  { name: "Gloves (Fabric)", price: "£3.95", code: "AC007" },
  { name: "Headband / Hairband", price: "£2.50", code: "AC008" }
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <h2 className="pricing-title">Our Pricing</h2>
        <p className="pricing-subtitle">
          Transparent, simple and professional pricing — scroll to explore.
        </p>

        {/* HORIZONTAL SCROLL WRAPPER */}
        <div className="pricing-scroll-wrapper">
          {pricingData.map((group, index) => (
            <div key={index} className="pricing-card">
              <div className="card-header">{group.category}</div>

              <table className="pricing-table">
                <tbody>
                  {group.items.map((item, i) => (
                    <tr key={i}>
                      <td className="service-name">{item.name}</td>
                      <td className="service-price">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <button className="pricing-btn" onClick={() => navigate("/pricing")}>
          View Full Price List
        </button>
      </div>
    </section>
  );
}
