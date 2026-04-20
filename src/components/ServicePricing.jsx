import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://api.ironingboy.com";

  const servicePricingCSS = `
/* SERVICE PRICING - CLEAN WHITE DESIGN */

/* 🔒 FORCE PAGE TO START AT TOP */
html, body {
  margin: 0;
  padding: 0;
}

.service-pricing-container {
  margin-top: 0 !important;
  padding-top: 0 !important;
  position: relative;
  top: 0;
}


.service-pricing-container {
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  padding-bottom: 260px;
  position: relative;
}
  @media (max-width: 640px) {
  .service-pricing-container {
    padding-bottom: 300px;
  }
}

/* ==================== HEADER ==================== */
.service-pricing-header {
  background: #ffffff;
  padding: 0 0 24px;
  border-bottom: 1px solid #e2e8f0;
}

.service-pricing-header h1 {
  margin-top: 0;
}

.back-to-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 107, 0, 0.08);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 10px;
  color: #FF6B00;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 20px;
  margin-bottom: 8px;
}

.back-to-home:hover {
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  color: #ffffff;
  transform: translateX(-2px);
}

.header-main {
  text-align: center;
  padding: 0 20px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 107, 0, 0.08);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 9999px;
  color: #FF6B00;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.service-pricing-header h1 {
  font-size: 2.25rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.header-subtitle {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
  opacity: 0.9;
}

.search-container {
  position: relative;
  max-width: 400px;
  margin: 20px auto 0;
  padding: 0 20px;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  border-color: #FF6B00;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}

.search-container i {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  font-size: 1rem;
}

/* ==================== BREADCRUMB ==================== */
.breadcrumb {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.breadcrumb button {
  background: none;
  border: none;
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.breadcrumb button:hover {
  color: #FF6B00;
  background: rgba(255, 107, 0, 0.08);
}

.breadcrumb button.active {
  color: #FF6B00;
  font-weight: 600;
  background: rgba(255, 107, 0, 0.08);
}

.breadcrumb i {
  color: #718096;
  font-size: 0.7rem;
}

.breadcrumb .current {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 4px 8px;
}

/* ==================== SERVICE SELECTION ==================== */
.services-selection {
  padding: 40px 20px 20px;
}

.services-selection h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.selection-subtitle {
  font-size: 1rem;
  color: #4a5568;
  text-align: center;
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.services-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .services-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .services-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.service-selection-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.service-selection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.selection-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-selection-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.selection-card-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.selection-item-tag {
  padding: 4px 10px;
  background: rgba(255, 107, 0, 0.08);
  color: #FF6B00;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.selection-more-tag {
  padding: 4px 10px;
  background: rgba(113, 128, 150, 0.08);
  color: #718096;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.selection-card-arrow {
  color: #718096;
  font-size: 1rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.service-selection-card:hover .selection-card-arrow {
  color: #FF6B00;
  transform: translateX(4px);
}

/* ==================== SERVICE ITEMS SELECTION ==================== */
.service-items-selection {
  padding: 40px 20px 20px;
}

.selection-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  border-color: #FF6B00;
  color: #FF6B00;
  transform: translateX(-2px);
}

.selection-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.items-selection-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .items-selection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .items-selection-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.item-selection-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-selection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.item-emoji-large {
  font-size: 3.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.item-card-content {
  flex: 1;
}

.item-card-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.3;
}

.item-gender-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.gender-tag {
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.gender-tag.men {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.gender-tag.women {
  background: rgba(236, 72, 153, 0.1);
  color: #EC4899;
}

.gender-tag.children {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.gender-tag.unisex {
  background: rgba(113, 128, 150, 0.1);
  color: #718096;
}

.item-card-arrow {
  color: #718096;
  font-size: 1rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.item-selection-card:hover .item-card-arrow {
  color: #FF6B00;
  transform: translateX(4px);
}

/* ==================== TODO LIST SECTION ==================== */
.products-todo-section {
  padding: 40px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.todo-section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.todo-section-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.todo-filters {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  margin: 24px 0 32px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .todo-filters {
    grid-template-columns: repeat(3, 1fr);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #FF6B00;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}

/* ==================== TODO LIST ==================== */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.todo-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.todo-item-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.todo-emoji {
  font-size: 2rem;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
}

.todo-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.todo-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.todo-service-type {
  font-size: 0.8rem;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border-radius: 9999px;
  font-weight: 500;
}

.todo-gender {
  font-size: 0.8rem;
  padding: 2px 8px;
  background: rgba(113, 128, 150, 0.1);
  color: #718096;
  border-radius: 9999px;
  font-weight: 500;
}

.todo-item-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.todo-pricing {
  min-width: 100px;
  text-align: right;
}

.todo-price-single {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.todo-actions {
  min-width: 100px;
}

.todo-add-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.todo-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
}

.todo-quantity-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 107, 0, 0.08);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 10px;
  padding: 6px;
  min-width: 100px;
}

.todo-qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #ffffff;
  color: #FF6B00;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.todo-qty-btn:hover {
  background: #FF6B00;
  color: #ffffff;
}

.todo-qty-display {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-width: 32px;
  text-align: center;
}

/* ==================== NO PRODUCTS ==================== */
.no-products {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  margin: 40px 0;
}

.no-products-icon {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: rgba(255, 107, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.no-products-icon i {
  font-size: 1.5rem;
  color: #FF6B00;
}

.no-products h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.no-products p {
  color: #4a5568;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.reset-filters-btn {
  padding: 10px 20px;
  background: rgba(255, 107, 0, 0.08);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 10px;
  color: #FF6B00;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.reset-filters-btn:hover {
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  color: #ffffff;
  border-color: transparent;
  transform: translateY(-1px);
}

/* ==================== CART SUMMARY ==================== */




.cart-summary-top {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.05) 0%, rgba(255, 140, 0, 0.05) 100%);
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon-wrapper {
  position: relative;
}

.cart-icon-wrapper i {
  font-size: 1.5rem;
  color: #FF6B00;
}

.cart-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #FF6B00;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.cart-details {
  display: flex;
  flex-direction: column;
}

.cart-items-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
}

.cart-total-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cart-summary-top i {
  color: #718096;
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.cart-summary.expanded .cart-summary-top i {
  transform: rotate(180deg);
}



.cart-items h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cart-item {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.cart-item-emoji {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.3;
}

.cart-item-price {
  font-size: 0.85rem;
  color: #718096;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 107, 0, 0.08);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 10px;
  padding: 4px;
}

.cart-qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: #ffffff;
  color: #FF6B00;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.cart-qty-btn:hover {
  background: #FF6B00;
  color: #ffffff;
}

.cart-qty {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.cart-item-total {
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-width: 70px;
  text-align: right;
}

.cart-summary-bottom {
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
}

.cart-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
}

.cart-total-section span:first-child {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.cart-final-total {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cart-actions {
  display: flex;
  gap: 12px;
}

.cart-clear-btn {
  flex: 1;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cart-clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.cart-checkout-btn {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.cart-checkout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
}

.cart-checkout-btn i {
  transition: transform 0.2s ease;
}

.cart-checkout-btn:hover i {
  transform: translateX(4px);
}

/* ==================== QUICK BOOKING CTA ==================== */
.quick-booking-cta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
  margin: 40px 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.cta-content {
  max-width: 400px;
  margin: 0 auto;
}

.cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: 9999px;
  color: #059669;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.quick-booking-cta h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.quick-booking-cta p {
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 20px;
}

.quick-book-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.quick-book-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
}

/* ==================== LOADING STATE ==================== */
.service-pricing-loading {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 107, 0, 0.1);
  border-top-color: #FF6B00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.service-pricing-loading p {
  font-size: 1rem;
  color: #4a5568;
  font-weight: 500;
}

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 768px) {
  .service-pricing-header h1 {
    font-size: 1.75rem;
  }
  
  .todo-item-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  
  .todo-pricing {
    min-width: auto;
  }
  
  .todo-actions {
    min-width: auto;
  }
  
  .cart-actions {
    flex-direction: column;
  }
  
  .cart-item-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  
  .service-pricing-header {
    padding-bottom: 16px;
  }

  .search-container {
    margin-top: 12px;
  }
}

@media (max-width: 480px) {
  .service-pricing-header h1 {
    font-size: 1.5rem;
  }
  
  .selection-header h2,
  .todo-section-header h2,
  .services-selection h2 {
    font-size: 1.4rem;
  }
  
  .item-emoji-large {
    font-size: 2.5rem;
  }
  
  .todo-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .todo-item-right {
    align-items: stretch;
  }
  
  .todo-pricing {
    text-align: left;
  }
  
 
  
}

/* ==================== ANIMATIONS ==================== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-selection-card,
.item-selection-card,
.todo-item {
  animation: fadeIn 0.3s ease-out;
}

/* ==================== MOBILE OPTIMIZATION ==================== */
@media (max-width: 640px) {

  /* 🔒 Hide Service Type & Sort By on mobile */
  .todo-filters .filter-group:nth-child(2),
  .todo-filters .filter-group:nth-child(3) {
    display: none;
  }

  /* Reduce filter card padding */
  .todo-filters {
    padding: 12px;
    margin: 16px 0 20px;
  }

  /* ==================== PRODUCT ROW LAYOUT ==================== */
  .todo-item {
    padding: 12px;
    gap: 12px;
  }

  /* Force price + add button inline */
  .todo-item-right {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  /* ==================== PRICE STYLING ==================== */
  .todo-price-single {
    font-size: 1rem;        /* smaller */
    font-weight: 600;      /* reduced weight */
  }

  /* ==================== ADD BUTTON ==================== */
  .todo-add-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  /* Quantity controls compact */
  .todo-quantity-control {
    padding: 4px;
    min-width: 88px;
  }

  .todo-qty-btn {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }

  .todo-qty-display {
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* ==================== PRODUCT TITLE ==================== */
  .todo-content h4 {
    font-size: 0.95rem;
    font-weight: 600;
  }

  /* Meta tags smaller */
  .todo-service-type,
  .todo-gender {
    font-size: 0.7rem;
  }
}
  .call-us-button {
  position: fixed;
  bottom: 110px; 
  right: 20px;
  z-index: 2000; 
}
/* ==================== MODERN FIXED CART ==================== */

.cart-summary {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;

  background: #fff;
  border-radius: 20px;
  border: 2px solid #FF6B00;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);

  z-index: 9999;

  display: flex;
  flex-direction: column;

  max-height: calc(100vh - 40px);  /* 🔥 FIXED */
  overflow: hidden;

  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* TOP HEADER */
.cart-summary-top {
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* CONTENT WRAPPER */
.cart-summary-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

/* 🔥 SCROLLABLE ITEMS AREA */
.cart-items {
  flex: 1;
  min-height: 0;        /* 🔥 CRITICAL FIX */
  overflow-y: auto;
  overflow-x: hidden;   /* ❌ Remove horizontal scroll */
  padding: 16px 20px;
}

/* KEEP BUTTONS ALWAYS VISIBLE */
.cart-summary-bottom {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

/* Scrollbar */
.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #FF6B00;
  border-radius: 10px;
}

/* CART ADD ANIMATION */
.cart-summary.animate {
  animation: cartBounce 0.4s ease;
}

@keyframes cartBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

/* MOBILE */
@media (max-width: 640px) {
  .cart-summary {
    bottom: 10px;
    left: 10px;
    right: 10px;
    max-height: calc(100vh - 20px); /* 🔥 FIXED */
  }
}

}
/* ==================== MODERN FIXED CART ==================== */

.cart-summary {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: #fff;
  border-radius: 20px;
  border: 2px solid #FF6B00;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* TOP HEADER */
.cart-summary-top {
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* CONTENT WRAPPER - FIXED SCROLLING */
.cart-summary-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;  /* CRITICAL for flexbox scrolling */
  height: 100%;
  overflow: hidden;
}

/* 🔥 SCROLLABLE ITEMS AREA - FIXED */
.cart-items {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 20px;
  max-height: 300px; /* Adjust this value as needed */
  min-height: 0; /* CRITICAL for flexbox scrolling */
}

/* KEEP BUTTONS ALWAYS VISIBLE */
.cart-summary-bottom {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

/* Scrollbar styling */
.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #FF6B00;
  border-radius: 10px;
}

.cart-items::-webkit-scrollbar-thumb:hover {
  background: #FF8C00;
}

/* CART ADD ANIMATION */
.cart-summary.animate {
  animation: cartBounce 0.4s ease;
}

@keyframes cartBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1.05); }
}

/* MOBILE */
@media (max-width: 640px) {
  .cart-summary {
    bottom: 10px;
    left: 10px;
    right: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .cart-items {
    max-height: 250px; /* Smaller on mobile */
  }
}
`;

const SERVICE_TYPE_MAP = {
  laundry: "wash_iron",
  dry_cleaning: "dry_clean",
  ironing: "iron",
  service_wash: "service_wash",
  repair: "repair",
  shoe_cleaning: "shoe_clean"
};


const ServicePricing = () => {
  const services = useMemo(() => [
    {
      id: "laundry",
      name: "Wash & Iron",
      icon: "fa-tshirt",
      emoji: "🧺",
      color: "#3B82F6",
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
      needsFilters: true,
      items: [
        { id: "shirts", name: "Shirts", emoji: "👔", keywords: ["shirt", "formal shirt", "dress shirt", "shirts", "men shirt", "women shirt"], gender: ["men", "women", "children"], category: "clothing" },
        // { id: "t_shirts", name: "T-Shirts", emoji: "👕", keywords: ["t-shirt", "tee", "t shirt", "tshirt", "cotton shirt", "t-shirts", "t shirts"], gender: ["men", "women", "children"], category: "clothing" },
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
        // { id: "mixed_bundle", name: "Mixed Bundle", emoji: "📦", keywords: ["mixed bundle", "mixed wash", "service wash"], gender: ["unisex"], category: "bundle" },
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
        // { id: "buttons", name: "Buttons", emoji: "🔘", keywords: ["button", "button replacement", "buttons", "sew button"], gender: ["men", "women", "children"], category: "repair" },
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
        // { id: "formal_shoes", name: "Formal Shoes", emoji: "👞", keywords: ["formal shoe", "dress shoe", "leather shoe", "formal shoes"], gender: ["men", "women"], category: "footwear" },
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

const getServiceType = useCallback((serviceCategory) => {
  return SERVICE_TYPE_MAP[serviceCategory] || "other";
}, []);



  const categorizeProduct = useCallback((product) => {
  const cleanName = cleanText(product.name);
  const gender = getProductGender(product.name);

  let serviceCategory = null;
  let itemCategory = null;

  for (const service of services) {
    const serviceType = SERVICE_TYPE_MAP[service.id];

    const matchesService = {
      wash_iron:
        cleanName.includes("wash") ||
        cleanName.includes("laundry"),

      iron:
        cleanName.includes("iron") ||
        cleanName.includes("ironing") ||
        cleanName.includes("press"),

      dry_clean:
        cleanName.includes("dry"),

      service_wash:
        cleanName.includes("service") ||
        cleanName.includes("bundle"),

      repair:
        cleanName.includes("repair") ||
        cleanName.includes("alter") ||
        cleanName.includes("zip") ||
        cleanName.includes("button"),

      shoe_clean:
        cleanName.includes("shoe")
    }[serviceType];

    if (!matchesService) continue;

    for (const item of service.items) {
      if (item.keywords.some(k => cleanName.includes(cleanText(k)))) {
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
    hasOffer:
      !!product.offer_price &&
      product.offer_price < (product.standard_price || product.price || 0),
    cleanName,
    gender,
    serviceCategory,
    itemCategory,
    serviceType: SERVICE_TYPE_MAP[serviceCategory],
    originalData: product
  };
}, [services, cleanText, getProductGender]);




  useEffect(() => {
    const savedCart = localStorage.getItem('laundryCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
  // Add a class to the body when the component mounts
  document.body.classList.add('hide-reviewability-popup');
  
  // Remove the class when the component unmounts
  return () => {
    document.body.classList.remove('hide-reviewability-popup');
  };
}, []);
  useEffect(() => {
    localStorage.setItem('laundryCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
  if (!location.state?.serviceCategory) return;

  const foundService = services.find(
    s => s.id === location.state.serviceCategory
  );

  if (foundService) {
    setSelectedService(foundService);

    // 🔒 lock service type immediately
    setServiceTypeFilter(SERVICE_TYPE_MAP[foundService.id]);
  }
}, [location.state, services]);


useEffect(() => {
    document.body.classList.add('hide-reviewability-popup');
    return () => {
      document.body.classList.remove('hide-reviewability-popup');
    };
  }, []);

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
  const requiredServiceType = SERVICE_TYPE_MAP[selectedService.id];

  result = result.filter(product =>
    product.serviceType === requiredServiceType
  );

  if (selectedItem) {
    result = result.filter(
      product => product.itemCategory === selectedItem.id
    );
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
    
    if (!selectedService && serviceTypeFilter !== "all") {
  result = result.filter(product => {
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

  // 🔒 Lock service type automatically
  setServiceTypeFilter(
    service.id === "laundry" ? "wash_iron" :
    service.id === "dry_cleaning" ? "dry_clean" :
    service.id === "ironing" ? "iron" :
    service.id === "service_wash" ? "service_wash" :
    service.id === "repair" ? "repair" :
    service.id === "shoe_cleaning" ? "shoe_clean" :
    "all"
  );
};


  const handleItemSelect = (item) => {
  setSelectedItem(item);
  setSearchTerm("");
  setGenderFilter("all");
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

  switch (serviceType) {
    case "wash_iron":
      return "Wash & Iron";

    case "wash":
      return "Wash Only";

    case "iron":
      return "Iron Only";

    case "dry_clean":
      return "Dry Clean";

    case "service_wash":
      return "Service Wash";

    case "repair":
      return "Repair";

    case "shoe_clean":
      return "Shoe Cleaning";

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

  // 🔥 Trigger cart animation
  const cartEl = document.querySelector('.cart-summary');
  if (cartEl) {
    cartEl.classList.add('animate');
    setTimeout(() => {
      cartEl.classList.remove('animate');
    }, 400);
  }
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
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  navigate("/checkout", { 
    state: { 
      items: cart,
      subtotal,
      tip: 0,
      total: subtotal
    } 
  });
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
    <>
    <style>{servicePricingCSS}</style>
    <div className="service-pricing-container">
      
      {/* Header */}
      <div className="service-pricing-header" >
        <button 
          className="back-to-home"
          onClick={() => navigate(-1)} style={{marginTop:"16px"}}
        >
          <i className="fas fa-arrow-left" ></i> Back
        </button>
        <div className="header-main">
          <div className="header-badge">
            <i className="fas fa-pound-sign"></i>
            <span>Transparent Pricing</span>
          </div>
          <h1>Service Pricing</h1>
          <p className="header-subtitle">
            Clear, upfront pricing for all our premium laundry services
          </p>
        </div>
        {/* <div className="search-container">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="fas fa-search"></i>
        </div> */}
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={clearFilters} className={!selectedService ? 'active' : ''}>
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
            <span className="current" >{selectedItem.name}</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="service-pricing-content">
        
        {/* Service Categories - Card Style */}
        {!selectedService && (
          <div className="services-selection">
            <h2 >Choose a Service</h2>
            <p className="selection-subtitle">Select from our professional laundry services</p>
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
              <div className="filter-group" style={{color:"#1a1a1a"}}>
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
  className="filter-select"
  disabled={!!selectedService}
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
                    <div key={product.id} className="todo-item" style={{color:"#1a1a1a"}}>
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
                        <div className="todo-pricing" style={{color:"#1a1a1a"}}>
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
      <span className="cart-count">{getCartItemCount()}</span>
    </div>

    <div className="cart-details">
      <span className="cart-label">Your Basket</span>
      <span className="cart-items-text">
        {getCartItemCount()} items
      </span>
      <span className="cart-total-text">
        {formatPrice(getCartTotal())}
      </span>
    </div>
  </div>

  <i className={`fas fa-chevron-${showCart ? "up" : "down"}`}></i>
</div>
          
          {showCart && (
  <div className="cart-summary-content">
    
    <div className="cart-items">
      <h4>Your Cart</h4>

      {cart.map(item => (
  <div key={item.id} className="cart-item">

    <div className="cart-item-left">
      <span className="cart-item-emoji">{item.emoji}</span>
      <div className="cart-item-info">
        <h5>{item.name}</h5>
        <span className="cart-item-price">
          {formatPrice(item.price)} × {item.quantity}
        </span>
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

      <div className="cart-item-total">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>

  </div>
))}
    </div>

    <div className="cart-summary-bottom">
      <div className="cart-total-section">
        <span>Subtotal</span>
        <span className="cart-final-total">
          {formatPrice(getCartTotal())}
        </span>
      </div>

      <div className="cart-actions">
        <button className="cart-clear-btn" onClick={clearCart}>
          Clear Cart
        </button>

        <button
          className="cart-checkout-btn"
          onClick={handleProceedToCheckout}
        >
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
    </>
  );
};

export default ServicePricing;