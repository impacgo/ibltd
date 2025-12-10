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
import AreaDetails from "./components/AreaDetails";
import ServicePage from "./components/ServicePage";
import AreaServicePage from "./components/AreaServicePage";
import CategoryDetails from "./components/CategoryDetails";
import Checkout from './components/Checkout';
import PersonalInfo from "./components/PersonalInfo";
import QuickBooking from "./components/QuickBooking";
import { AuthProvider } from './context/AuthContext';
import OrderHistory from './components/OrderHistory';
import ServiceDetail from './components/ServiceDetail';

// REMOVE OR COMMENT OUT THE MISSING IMPORT
// import AccountDeletionRequest from './components/AccountDeletionRequest';

// Home component - Remove QuickBooking from here since it's on a separate page
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
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            {/* TWO ROUTES FOR CATEGORY DETAILS - KEEP BOTH FOR BACKWARD COMPATIBILITY */}
            <Route path="/services/:id" element={<CategoryDetails />} />
            <Route path="/category/:categoryId" element={<ServiceDetailPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<PersonalInfo />} />
            <Route path="/quick-booking" element={<QuickBookingPage />} />
            {/* FIX: Removed duplicate /areas route - keep only one */}
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/areas/:slug" element={<AreaDetails />} />
            <Route path="/areas/:slug/:serviceSlug" element={<AreaServicePage />} />
            
            {/* REMOVE OR COMMENT OUT THE MISSING ROUTE */}
            {/* <Route path="/delete-request" element={<AccountDeletionRequest />} /> */}
            
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/services/:serviceSlug" element={<ServicePage />} />
            <Route path="/orders" element={<OrderHistory />} />
            
            {/* 404/Catch-all route should be LAST */}
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;