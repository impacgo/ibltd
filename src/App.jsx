// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TotalPricing from './components/totalpricing';
import './App.css';
import SearchResults from './components/SearchResults';
import AuthLogin from './components/AuthLogin';
import ComingSoon from './components/ComingSoon';
import ServiceAreas from './components/ServiceAreas';

// Home component
const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
};

// Services page component
const ServicesPage = () => {
  return (
    <div className="page-container">
      <Services />
      <Footer />
    </div>
  );
};

// Pricing page component
const PricingPage = () => {
  return (
    <div className="page-container">
      <TotalPricing />
      <Footer />
    </div>
  );
};

// Login page component
const LoginPage = () => {
  return <AuthLogin />;
};

// How it works page
const HowItWorksPage = () => (
  <div className="page-container">
    <HowItWorks />
    <Footer />
  </div>
);

// Testimonials page
const TestimonialsPage = () => (
  <div className="page-container">
    <Testimonials />
    <Footer />
  </div>
);

// FAQ page
const FAQPage = () => (
  <div className="page-container">
    <FAQ />
    <Footer />
  </div>
);

// Contact page
const ContactPage = () => (
  <div className="page-container">
    <Contact />
    <Footer />
  </div>
);

// Areas Page
const AreasPage = () => (
  <div className="page-container">
    <ServiceAreas />
    <Footer />
  </div>
);

// Quick Booking Page
const QuickBookingPage = () => (
  <div className="page-container">
    <QuickBooking />
    <Footer />
  </div>
);

// Service Detail Page
const ServiceDetailPage = () => (
  <div className="page-container">
    <ServiceDetail />
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<ComingSoon />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;