// src/components/Pricing.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Pricing.css";

const pricingData = [
  {
    category: "Full Body & Essentials",
    icon: "fas fa-tshirt",
    items: [
      { name: "Mens Shirt on Hanger", price: "£2.80", code: "CI001" },
      { name: "Mens Shirt Folded", price: "£3.55", code: "SH002" },
      { name: "Blouse: Child's - Press Only - Folded", price: "£3.49", code: "CI003" },
      { name: "Socks: Wash & Press - Folded", price: "£1.20" },
      { name: "Ladies Shirt on Hanger", price: "£2.89", code: "SH003" },
      { name: "Underwear: Press Only - Folded", price: "£0.95" },
      { name: "Face Mask: Wash & Press", price: "£1.90" },
      { name: "Child's Dress Shirt", price: "£3.21", code: "CI008" },
      { name: "BraL Wash & Press - Folded", price: "£2.45" },
    ],
  },
  {
    category: "Household Extras",
    icon: "fas fa-home",
    items: [
      { name: "Pillowcase", price: "£2.35", code: "BH011" },
      { name: "Toy: Wash & Press", price: "£5.25" },
      { name: "Sheet: Single", price: "£5.50", code: "BH012" },
      { name: "Toy: Dry Clean", price: "£5.25" },
      { name: "Table Mat - Wash & Press", price: "£3.55", code: "BH022" },
      { name: "Blinds - per m²", price: "£5.10", code: "BH031" },
      { name: "Towel (up to 1.5m)", price: "£1.85", code: "BH041" },
      { name: "Towel - Hand - Press Only - Folded", price: "£1.00" },
    ],
  },
  {
    category: "Accessories",
    icon: "fas fa-hat-wizard",
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
  const scrollContainerRef = useRef(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstChild?.offsetWidth || 0;
      const scrollAmount = cardWidth + 24; // card width + gap
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstChild?.offsetWidth || 0;
      const scrollAmount = cardWidth + 24; // card width + gap
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        {/* Header Section */}
        <div className="pricing-header">
          <div className="pricing-badge">
            <i className="fas fa-tag"></i>
            <span>Transparent Pricing</span>
          </div>
          
          <h1 className="pricing-title">
            Simple & 
            <span className="highlight"> Transparent</span> Pricing
          </h1>
          
          <p className="pricing-subtitle">
            No hidden fees, no surprises. Just professional laundry service at fair prices.
          </p>
        </div>

        {/* Pricing Information Box */}
        <div className="pricing-info-box">
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-pound-sign"></i>
            </div>
            <div className="info-content">
              <span className="info-label">Minimum Order</span>
              <span className="info-value">£20</span>
            </div>
          </div>
          
          <div className="info-divider"></div>
          
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="info-content">
              <span className="info-label">Service Charge</span>
              <span className="info-value">£2</span>
            </div>
          </div>
          
          <div className="info-divider"></div>
          
          <div className="info-item">
            <div className="info-icon">
              <i className="fas fa-truck"></i>
            </div>
            <div className="info-content">
              <span className="info-label">Pickup & Delivery</span>
              <span className="info-value">Free</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Container with Horizontal Scroll on Mobile */}
        <div className="pricing-cards-wrapper">
          {/* Mobile Navigation Buttons */}
          <button 
            className="mobile-scroll-btn left-btn"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div 
            className="pricing-cards-container"
            ref={scrollContainerRef}
          >
            <div className="pricing-cards-grid">
              {pricingData.map((group, index) => (
                <div key={index} className="pricing-card">
                  <div className="card-header">
                    <div className="category-icon">
                      <i className={group.icon}></i>
                    </div>
                    <h3 className="category-title">{group.category}</h3>
                  </div>
                  
                  <div className="card-body">
                    <div className="pricing-table-wrapper">
                      <table className="pricing-table">
                        <tbody>
                          {group.items.map((item, i) => (
                            <tr key={i} className="pricing-row">
                              <td className="service-info">
                                <span className="service-name">{item.name}</span>
                                {/* {item.code && (
                                  <span className="service-code">Code: {item.code}</span>
                                )} */}
                              </td>
                              <td className="service-price">
                                <span className="price-value">{item.price}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* <div className="card-footer">
                    <div className="item-count">
                      <i className="fas fa-list"></i>
                      <span>{group.items.length} items</span>
                    </div>
                    <div className="starting-from">
                      Starting from £{group.items.reduce((min, item) => {
                        const price = parseFloat(item.price.replace('£', '')) || 0;
                        return price < min ? price : min;
                      }, Infinity).toFixed(2)}
                    </div>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="mobile-scroll-btn right-btn"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* CTA Section */}
        <div className="pricing-cta">
          <div className="cta-content">
            <h3>Need a Custom Quote?</h3>
            <p>For bulk orders or special items, get a personalized quote</p>
            
            <div className="cta-actions">
              <button 
                className="primary-cta-btn"
                onClick={() => navigate("/quick-booking")}
              >
                <i className="fas fa-calendar-check"></i>
                Book Now with Transparent Pricing
              </button>
              
              <button 
                className="secondary-cta-btn"
                onClick={() => navigate("/pricing")}
              >
                <i className="fas fa-list-alt"></i>
                View Full Price List
              </button>
            </div>
            
            <div className="cta-note">
              <i className="fas fa-info-circle"></i>
              <span>All prices include professional cleaning, pressing, and eco-friendly detergents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}