// src/components/Pricing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const pricingCategories = [
  {
    category: "Clothing Services",
    items: [
      { name: "Mens Shirt on Hanger", price: "£4.50" },
      { name: "Mens Shirt Folded", price: "£5.00" },
      { name: "Ladies Shirt on Hanger", price: "£4.75" },
      { name: "Ladies Shirt Folded", price: "£5.25" },
      { name: "Dry Clean - Shirt", price: "£6.00" },
      { name: "Iron Only - Shirt", price: "£2.50" },
    ]
  },
  {
    category: "Household Items",
    items: [
      { name: "Bed Set: Single", price: "£15.00" },
      { name: "Bed Set: Double", price: "£20.00" },
      { name: "Bed Set: King", price: "£25.00" },
      { name: "Super King", price: "£30.00" },
      { name: "Pillowcase", price: "£2.00" },
      { name: "Duvet Cover", price: "£6.00" },
    ]
  },
  {
    category: "Specialty Items",
    items: [
      { name: "Coat (Fur)", price: "£40.00" },
      { name: "Coat (Leather/Suede)", price: "£35.00" },
      { name: "Handbag", price: "£25.00" },
      { name: "Shoes", price: "£20.00" },
      { name: "Trainers", price: "£18.00" },
      { name: "Wash & Fold (5kg)", price: "£18.00" },
    ]
  }
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleViewAllPrices = () => {
    navigate('/pricing'); // Navigate to full pricing page
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        {/* Header */}
        <div className="pricing-header">
          <h1>Our Pricing</h1>
          <p>Simple, transparent pricing for all your laundry needs</p>
        </div>

        {/* Pricing Tables with Horizontal Scroll */}
        <div className="pricing-tables-wrapper">
          <div className="pricing-tables-scroll">
            {pricingCategories.map((categoryData, index) => (
              <div key={index} className="pricing-table">
                <div className="table-header">
                  <h3>{categoryData.category}</h3>
                </div>
                <div className="table-content">
                  {categoryData.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="table-row">
                      <span className="service-name">{item.name}</span>
                      <span className="service-price">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pricing-cta">
          <button className="cta-btn" onClick={handleViewAllPrices}>
            View All Price List
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;