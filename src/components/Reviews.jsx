// src/pages/Reviews.jsx
import React from 'react';
import ReviewsPageWidget from '../components/ReviewsPageWidget';
import SubmitReviewForm from '../components/SubmitReviewForm';
import './Reviews.css';
import { useNavigate } from 'react-router-dom';

const ReviewPagesCss =`/* src/pages/Reviews.css */
:root {
  --reviews-bg: #ffffff;
  --reviews-text-primary: #111827;
  --reviews-text-secondary: #6b7280;
  --reviews-accent: #FF6B00;
  --reviews-accent-gradient: linear-gradient(135deg, #FF6B00, #FF8C00);
  --reviews-radius-lg: 16px;
  --reviews-radius-xl: 20px;
  --reviews-shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);
  --reviews-shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
  --reviews-shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.reviews-page {
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f9fafb;
}

.reviews-container {
  width: 100%;
}

/* Header */
.reviews-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid rgba(255, 107, 0, 0.2);
  border-radius: 100px;
  color: #ff8c00;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.section-badge i {
  font-size: 0.95rem;
}

.reviews-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--reviews-text-primary);
  margin: 0 0 16px 0;
  background: var(--reviews-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.reviews-subtitle {
  font-size: 1.2rem;
  color: var(--reviews-text-secondary);
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
}

/* Trust Metrics */
.trust-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 60px 0 80px 0;
}

.metric-card {
  background: white;
  padding: 30px;
  border-radius: var(--reviews-radius-lg);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: var(--reviews-shadow-md);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--reviews-accent-gradient);
  border-radius: var(--reviews-radius-lg) var(--reviews-radius-lg) 0 0;
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--reviews-shadow-xl);
  border-color: rgba(255, 107, 0, 0.2);
}

.metric-value {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--reviews-accent);
  margin-bottom: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.metric-label {
  font-size: 0.95rem;
  color: var(--reviews-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

/* Main Content - Two Columns */
.reviews-main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--reviews-text-primary);
  margin-bottom: 12px;
  line-height: 1.2;
}

.section-header p {
  color: var(--reviews-text-secondary);
  font-size: 1.05rem;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
}

/* Form Section */
.reviews-form-section {
  background: white;
  padding: 40px;
  border-radius: var(--reviews-radius-xl);
  box-shadow: var(--reviews-shadow-lg);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

/* Widget Section */
.reviews-widget-section {
  background: white;
  padding: 40px;
  border-radius: var(--reviews-radius-xl);
  box-shadow: var(--reviews-shadow-lg);
  border: 1px solid rgba(229, 231, 235, 0.8);
  display: flex;
  flex-direction: column;
}

.reviews-widget-container {
  flex: 1;
  min-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

/* Review Guidelines */
.review-guidelines {
  background: white;
  padding: 50px 40px;
  border-radius: var(--reviews-radius-xl);
  box-shadow: var(--reviews-shadow-lg);
  border: 1px solid rgba(229, 231, 235, 0.8);
  margin-bottom: 60px;
}

.guidelines-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  text-align: center;
  justify-content: center;
}

.guidelines-header i {
  font-size: 1.8rem;
  color: var(--reviews-accent);
}

.guidelines-header h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--reviews-text-primary);
  margin: 0;
}

.guidelines-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
}

.guideline-card {
  text-align: center;
  padding: 25px;
  border-radius: var(--reviews-radius-lg);
  background: rgba(255, 107, 0, 0.03);
  border: 1px solid rgba(255, 107, 0, 0.1);
  transition: all 0.3s ease;
}

.guideline-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 107, 0, 0.05);
  border-color: rgba(255, 107, 0, 0.2);
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.1);
}

.guideline-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 107, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--reviews-accent);
  font-size: 1.5rem;
}

.guideline-card h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--reviews-text-primary);
  margin-bottom: 12px;
}

.guideline-card p {
  color: var(--reviews-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* CTA Section */
.reviews-cta {
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 140, 0, 0.08) 100%);
  padding: 50px 40px;
  border-radius: var(--reviews-radius-xl);
  border: 1px solid rgba(255, 107, 0, 0.15);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.reviews-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 107, 0, 0.3) 50%, 
    transparent 100%
  );
}

.reviews-cta h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--reviews-text-primary);
  margin-bottom: 16px;
}

.reviews-cta p {
  color: var(--reviews-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.5;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: var(--reviews-accent-gradient);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(255, 107, 0, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 107, 0, 0.4);
}

.cta-button.secondary {
  background: white;
  color: var(--reviews-text-primary);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cta-button.secondary:hover {
  background: #f9fafb;
  border-color: rgba(209, 213, 219, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.cta-button i {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .reviews-title {
    font-size: 2.8rem;
  }
  
  .trust-metrics {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .guidelines-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .reviews-main-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .reviews-page {
    padding: 60px 16px;
  }
  
  .reviews-title {
    font-size: 2.4rem;
  }
  
  .reviews-subtitle {
    font-size: 1.1rem;
  }
  
  .trust-metrics {
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 40px 0 60px 0;
  }
  
  .metric-card {
    padding: 25px;
  }
  
  .metric-value {
    font-size: 2.4rem;
  }
  
  .reviews-form-section,
  .reviews-widget-section,
  .review-guidelines,
  .reviews-cta {
    padding: 30px 24px;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .guidelines-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .guideline-card {
    padding: 20px;
  }
  
  .reviews-cta h3 {
    font-size: 1.8rem;
  }
  
  .reviews-cta p {
    font-size: 1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .reviews-title {
    font-size: 2rem;
  }
  
  .reviews-subtitle {
    font-size: 1rem;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .reviews-form-section,
  .reviews-widget-section,
  .review-guidelines,
  .reviews-cta {
    padding: 25px 20px;
  }
  
  .section-header h2 {
    font-size: 1.6rem;
  }
  
  .reviews-cta h3 {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .reviews-form-section,
  .reviews-widget-section {
    padding: 20px 16px;
    box-shadow: none;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .reviews-widget-container {
    min-height: auto;
    border: none;
  }
}
/* MOBILE CONTENT PRIORITY */
@media (max-width: 768px) {
  .reviews-main-content {
    display: flex;
    flex-direction: column;
  }

  .reviews-widget-section {
    order: 1;
  }

  .reviews-form-section {
    order: 2;
  }
}

@media (max-width: 768px) {
  .section-badge {
    display: none;
  }

  .reviews-title {
    font-size: 1.8rem;
  }

  .reviews-subtitle {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .reviews-header {
    margin-bottom: 30px;
  }
}

/* =========================
   BACK BUTTON
========================= */
.reviews-back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  z-index: 10;
}

.reviews-back-btn i {
  font-size: 1rem;
}

/* =========================
   PAGE RESET (MOBILE FIRST)
========================= */
@media (max-width: 768px) {
  .reviews-page {
    padding: 24px 14px;
    background: #ffffff;
  }

  .reviews-container {
    padding-top: 20px;
  }
}

/* =========================
   HEADER SIMPLIFICATION
========================= */
@media (max-width: 768px) {
  .section-badge {
    display: none;
  }

  .reviews-header {
    margin-bottom: 24px;
    padding-top: 20px;
  }

  .reviews-title {
    font-size: 1.6rem;
    font-weight: 700;
  }

  .reviews-subtitle {
    font-size: 0.95rem;
    line-height: 1.4;
    max-width: 100%;
  }
}

/* =========================
   MAIN CONTENT (FORM FOCUS)
========================= */
@media (max-width: 768px) {
  .reviews-main-content {
    display: block;
    margin-bottom: 32px;
  }

  .reviews-form-section {
    padding: 16px;
    border-radius: 12px;
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .section-header p {
    font-size: 0.9rem;
  }
}

/* =========================
   REMOVE HEAVY SECTIONS ON MOBILE
========================= */
@media (max-width: 768px) {
  .review-guidelines,
  .reviews-cta {
    display: none;
  }
}

/* =========================
   DESKTOP ONLY VISIBILITY
========================= */
@media (min-width: 769px) {
  .reviews-back-btn {
    display: none;
  }
}
  /* src/components/SubmitReviewForm.css */
.review-form-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid rgba(229, 231, 235, 0.8);
  position: relative;
  overflow: hidden;
}

.review-form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B00, #FF8C00);
  border-radius: 20px 20px 0 0;
}

.review-form-header {
  text-align: center;
  margin-bottom: 30px;
}

.review-form-header h2 {
  font-size: 2.2rem;
  color: #111827;
  margin-bottom: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.review-form-header p {
  color: #6b7280;
  font-size: 1.05rem;
  line-height: 1.5;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #FF6B00;
  box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9ca3af;
  opacity: 0.7;
}

.email-note,
.char-count {
  display: block;
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.85rem;
}

/* Rating Section */
.rating-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-stars-input {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #e5e7eb;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.star-btn:hover {
  transform: scale(1.15);
}

.star-btn .fa-star {
  transition: all 0.3s ease;
}

.star-btn.active {
  color: #f59e0b;
}

.star-btn.active .fa-star {
  text-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* Emoji Feedback */
.rating-feedback {
  text-align: center;
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.emoji-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.emoji-container.visible {
  opacity: 1;
  transform: scale(1);
}

.emoji {
  font-size: 3rem;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.rating-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

/* Textarea */
.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

/* Service Select */
.service-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 16px;
  padding-right: 50px;
  cursor: pointer;
}

/* Form Footer */
.form-footer {
  margin-top: 30px;
  text-align: center;
}

.privacy-note {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.privacy-note i {
  color: #10b981;
  font-size: 1.1rem;
}

.submit-review-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 36px;
  background: linear-gradient(135deg, #FF6B00, #FF8C00);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 25px rgba(255, 107, 0, 0.3),
    0 2px 10px rgba(255, 107, 0, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.submit-review-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%
  );
  transition: left 0.6s ease;
}

.submit-review-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 30px rgba(255, 107, 0, 0.4),
    0 4px 15px rgba(255, 107, 0, 0.3);
}

.submit-review-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-review-btn:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(255, 107, 0, 0.3),
    0 2px 8px rgba(255, 107, 0, 0.2);
}

.submit-review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2) !important;
}

.submit-review-btn i {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.submit-review-btn:hover:not(:disabled) i {
  transform: translateX(4px);
}

/* Alternative Options */
.alternative-option {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.alternative-option p {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 1rem;
}

.external-review-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.external-review-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.external-review-btn.google {
  background: #f8f9fa;
  color: #374151;
  border: 1px solid #d1d5db;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.external-review-btn.google:hover {
  background: #f3f4f6;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.external-review-btn.facebook {
  background: #1877f2;
  color: white;
  border: 1px solid #1877f2;
  box-shadow: 0 4px 10px rgba(24, 119, 242, 0.2);
}

.external-review-btn.facebook:hover {
  background: #166fe5;
  box-shadow: 0 6px 16px rgba(24, 119, 242, 0.3);
  transform: translateY(-2px);
}

.external-review-btn i {
  font-size: 1.1rem;
}

.external-note {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-top: 15px;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .review-form-container {
    padding: 30px 20px;
    margin: 0 16px;
    border-radius: 16px;
  }
  
  .review-form-header h2 {
    font-size: 1.8rem;
  }
  
  .star-btn {
    font-size: 2.2rem;
  }
  
  .emoji {
    font-size: 2.5rem;
  }
  
  .external-review-links {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .external-review-btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
    padding: 14px 24px;
  }
  
  .submit-review-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .review-form-container {
    padding: 25px 16px;
  }
  
  .review-form-header h2 {
    font-size: 1.6rem;
  }
  
  .review-form-header p {
    font-size: 0.95rem;
  }
  
  .rating-stars-input {
    gap: 8px;
  }
  
  .star-btn {
    font-size: 2rem;
  }
  
  .emoji {
    font-size: 2.2rem;
  }
  
  .rating-text {
    font-size: 1rem;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 12px 16px;
  }
}
@media (max-width: 768px) {
  .review-form-container {
    padding: 20px 16px;
    box-shadow: none;
    border-radius: 12px;
  }

  .review-form-header h2 {
    font-size: 1.4rem;
  }

  .review-form-header p {
    font-size: 0.9rem;
  }

  .star-btn {
    font-size: 1.8rem;
  }

  .emoji {
    font-size: 2rem;
  }

  .submit-review-btn {
    font-size: 1rem;
    padding: 14px 20px;
  }

  .privacy-note {
    font-size: 0.8rem;
    padding: 10px;
  }
}
#reviewspage-widget {
  width: 100%;
  overflow-x: hidden;
}

`;
const Reviews = () => {
    const navigate = useNavigate();
  return (<>
  <style>{ReviewPagesCss}</style>
    <div className="reviews-page">
     <button
  className="reviews-back-btn"
  onClick={() => navigate(-1)}
  aria-label="Go back"
>
  <i className="fas fa-arrow-left"></i>
  <span>Back</span>
</button>
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <div className="section-badge">
            <i className="fas fa-star"></i>
            <span>Verified Reviews</span>
          </div>
          <h1 className="reviews-title">
            Customer Reviews
          </h1>
          <p className="reviews-subtitle">
            Real feedback from real customers who trust Ironing Boy for their laundry needs
          </p>
        </div>
        
        {/* Trust Metrics
        <div className="trust-metrics">
          <div className="metric-card">
            <div className="metric-value">4.8★</div>
            <div className="metric-label">Average Rating</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">2,500+</div>
            <div className="metric-label">Reviews</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">98%</div>
            <div className="metric-label">Satisfaction</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">24h</div>
            <div className="metric-label">Response Time</div>
          </div>
        </div> */}
        
        {/* Main Content - Two Columns on Desktop */}
        
            <SubmitReviewForm />
          
          
          {/* Reviews Widget */}
          {/* <div className="reviews-widget-section">
            <div className="section-header">
              <h2>What Our Customers Say</h2>
              <p>Verified reviews from thousands of satisfied customers across the UK</p>
            </div>
            <div className="reviews-widget-container">
              <ReviewsPageWidget />
            </div>
          </div> */}
        
        
        {/* Review Guidelines */}
        <div className="review-guidelines">
          <div className="guidelines-header">
            <i className="fas fa-info-circle"></i>
            <h3>Review Guidelines</h3>
          </div>
          <div className="guidelines-list">
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <h4>Be Authentic</h4>
              <p>Share your genuine experience with our laundry services</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-star"></i>
              </div>
              <h4>Focus on Service</h4>
              <p>Rate based on quality, delivery time, and customer service</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Keep it Clean</h4>
              <p>Avoid personal information or inappropriate content</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4>Verified Reviews</h4>
              <p>All reviews are verified to ensure authenticity</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="reviews-cta">
          <h3>Questions About Our Services?</h3>
          <p>Contact our customer support team for any questions or concerns</p>
          <div className="cta-buttons">
            <button 
              className="cta-button"
              onClick={() => window.location.href = '/contact'}
            >
              <i className="fas fa-headset"></i> Contact Support
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => window.location.href = '/faq'}
            >
              <i className="fas fa-question-circle"></i> Visit FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
  
};

export default Reviews;
