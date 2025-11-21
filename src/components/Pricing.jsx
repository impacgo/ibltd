// src/components/Pricing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Pricing.css";

const pricingData = [
  {
    category: "Full Body & Essentials",
    items: [
      { name: "Underwear: Press Only - Folded", price: "£0.95" },
      { name: "Socks: Wash & Press - Folded", price: "£1.20" },
      { name: "Underwear: Wash & Press - Folded", price: "£1.20" },
      { name: "Face Mask: Wash & Press", price: "£1.90" },
      { name: "BraL Wash & Press - Folded", price: "£2.45" },
      { name: "Handkerchief: Press Only - Folded", price: "£2.53" },
    ],
  },
  {
    category: "Household Extras",
    items: [
      { name: "Personal Laundry Bag", price: "£0.00" },
      { name: "Toy: Wash & Press", price: "£5.25" },
      { name: "Toy: Dry Clean", price: "£5.25" },
      { name: "Toy: Large - Wash & Press", price: "£7.88" },
    ],
  },
  {
    category: "Accessories",
    items: [
      { name: "Belt (Free)", price: "£0.00" },
      { name: "Bow Tie: Dry Clean", price: "£3.55" },
      { name: "Scarf: Press Only - Hanger", price: "£4.86" },
      { name: "Tie: Press Only - Hanger", price: "£5.01" },
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
