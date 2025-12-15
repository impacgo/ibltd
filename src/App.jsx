// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
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
import TermsPage from "./components/TermsLink";
import ThankYouPage from './components/ThankYouPage';

// Define API_BASE constant for backward compatibility component
const API_BASE = "https://api.ironingboy.com";

// Component for backward compatibility - redirects old ID-based URLs to new slug-based URLs
const NavigateToSlug = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorySlug = async () => {
      try {
        console.log(`Redirecting old category ID: ${categoryId} to slug-based URL`);
        
        // Fetch categories to find the matching one
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
          const data = await response.json();
          const categories = Array.isArray(data) ? data : data.data || [];
          
          // Find category by ID
          const category = categories.find(cat => cat.id.toString() === categoryId.toString());
          
          if (category && category.name) {
            // Create slug from category name (same as slugify function)
            const slug = category.name.toLowerCase().replace(/\s+/g, '-');
            console.log(`Redirecting /category/${categoryId} to /category/${slug}`);
            navigate(`/category/${slug}`, { replace: true });
          } else {
            console.log(`Category with ID ${categoryId} not found, redirecting to /services`);
            navigate('/services');
          }
        } else {
          console.log(`Failed to fetch categories, redirecting to /services`);
          navigate('/services');
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategorySlug();
    } else {
      navigate('/services');
    }
  }, [categoryId, navigate]);

  if (loading) {
    return (
      <div className="loading-page" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Redirecting to new URL...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
};

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

// Service Detail Page wrapper - includes ServiceDetail component
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
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Services pages */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<CategoryDetails />} />
            <Route path="/services/:serviceSlug" element={<ServicePage />} />
            
            {/* Category pages - NEW SLUG-BASED ROUTES */}
            {/* This route matches /category/full-body, /category/household, etc. */}
            <Route path="/category/:categorySlug" element={<ServiceDetailPage />} />
            
            {/* Backward compatibility for old ID-based URLs */}
            {/* This route matches /category/1, /category/2, etc. and redirects to slug URLs */}
            <Route path="/category/:categoryId" element={<NavigateToSlug />} />
            
            {/* Other pages */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<PersonalInfo />} />
            <Route path="/quick-booking" element={<QuickBookingPage />} />
            
            {/* Areas pages */}
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/areas/:slug" element={<AreaDetails />} />
            <Route path="/areas/:slug/:serviceSlug" element={<AreaServicePage />} />
            
            {/* User pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            
            {/* Legal pages */}
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Coming soon page */}
            <Route path="/coming-soon" element={<ComingSoon />} />
            
            {/* Search */}
            <Route path="/search" element={<SearchResults />} />
            
            {/* 404/Catch-all route should be LAST */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;