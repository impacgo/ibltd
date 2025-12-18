// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import './App.css';
import { AuthProvider } from './context/AuthContext'; // FIXED: Changed from "../context/AuthContext" to "./context/AuthContext"
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop'; // We'll create this

// Define API_BASE constant for backward compatibility component
const API_BASE = "https://api.ironingboy.com";

// Lazy load components
const Hero = lazy(() => import('./components/Hero'));
const Services = lazy(() => import('./components/Services'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Pricing = lazy(() => import('./components/Pricing'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const FAQ = lazy(() => import('./components/FAQ'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const TotalPricing = lazy(() => import('./components/totalpricing'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const ComingSoon = lazy(() => import('./components/ComingSoon'));
const ServiceAreas = lazy(() => import('./components/ServiceAreas'));
const AreaDetails = lazy(() => import("./components/AreaDetails"));
const ServicePage = lazy(() => import("./components/ServicePage"));
const AreaServicePage = lazy(() => import("./components/AreaServicePage"));
const CategoryDetails = lazy(() => import("./components/CategoryDetails"));
const Checkout = lazy(() => import('./components/Checkout'));
const PersonalInfo = lazy(() => import("./components/PersonalInfo"));
const QuickBooking = lazy(() => import("./components/QuickBooking"));
const OrderHistory = lazy(() => import('./components/OrderHistory'));
const ServiceDetail = lazy(() => import('./components/ServiceDetail'));
const TermsPage = lazy(() => import("./components/TermsLink"));
const ThankYouPage = lazy(() => import('./components/ThankYouPage'));
const NotFound = lazy(() => import('./components/NotFound'));

// Component for backward compatibility - redirects old ID-based URLs to new slug-based URLs
const NavigateToSlug = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorySlug = async () => {
      try {
        console.log(`Redirecting old category ID: ${categoryId} to slug-based URL`);
        
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
          const data = await response.json();
          const categories = Array.isArray(data) ? data : data.data || [];
          
          const category = categories.find(cat => cat.id.toString() === categoryId.toString());
          
          if (category && category.name) {
            const slug = category.name.toLowerCase().replace(/\s+/g, '-');
            navigate(`/category/${slug}`, { replace: true });
          } else {
            navigate('/services');
          }
        } else {
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
    return <LoadingSpinner message="Redirecting..." />;
  }

  return null;
};

// In App.jsx, update the MainLayout component:
const MainLayout = ({ children, hideHeaderFooter = false }) => {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="App">
      {!hideHeaderFooter && <Header />}
      <main className="main-content" id="main-content">
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

// Page components
const HomePage = () => (
  <>
    <Hero />
    <Services />
    <HowItWorks />
    <Pricing />
    <Testimonials />
    <FAQ />
    <Contact />
  </>
);

const ServicesPage = () => <Services />;
const PricingPage = () => <TotalPricing />;
const HowItWorksPage = () => <HowItWorks />;
const TestimonialsPage = () => <Testimonials />;
const FAQPage = () => <FAQ />;
const ContactPage = () => <Contact />;
const AreasPage = () => <ServiceAreas />;
const QuickBookingPage = () => <QuickBooking />;
const ServiceDetailPage = () => <ServiceDetail />;

// Create a wrapper for all pages that need the MainLayout
const PageWrapper = ({ component: Component }) => (
  <MainLayout>
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  </MainLayout>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Add ScrollToTop component */}
        <ScrollToTop />
        
        <Routes>
          {/* Home page */}
          <Route path="/" element={
            <PageWrapper component={HomePage} />
          } />
          
          {/* Services pages */}
          <Route path="/services" element={
            <PageWrapper component={ServicesPage} />
          } />
          <Route path="/services/:id" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryDetails />
              </Suspense>
            </MainLayout>
          } />
          <Route path="/services/:serviceSlug" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ServicePage />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Category pages */}
          <Route path="/category/:categorySlug" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ServiceDetailPage />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Backward compatibility for old ID-based URLs */}
          <Route path="/category/:categoryId" element={
            <MainLayout>
              <NavigateToSlug />
            </MainLayout>
          } />
          
          {/* Other pages with MainLayout */}
          <Route path="/pricing" element={
            <PageWrapper component={PricingPage} />
          } />
          <Route path="/how-it-works" element={
            <PageWrapper component={HowItWorksPage} />
          } />
          <Route path="/testimonials" element={
            <PageWrapper component={TestimonialsPage} />
          } />
          <Route path="/faq" element={
            <PageWrapper component={FAQPage} />
          } />
          <Route path="/contact" element={
            <PageWrapper component={ContactPage} />
          } />
          <Route path="/profile" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <PersonalInfo />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Quick Booking page - WITH MainLayout */}
          <Route path="/quick-booking" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <QuickBooking />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Areas pages */}
          <Route path="/areas" element={
            <PageWrapper component={AreasPage} />
          } />
          <Route path="/areas/:slug" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AreaDetails />
              </Suspense>
            </MainLayout>
          } />
          <Route path="/areas/:slug/:serviceSlug" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AreaServicePage />
              </Suspense>
            </MainLayout>
          } />
          
          {/* User pages */}
          <Route path="/checkout" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <Checkout />
              </Suspense>
            </MainLayout>
          } />
          <Route path="/orders" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <OrderHistory />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Legal pages */}
          <Route path="/terms" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <TermsPage />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Search */}
          <Route path="/search" element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <SearchResults />
              </Suspense>
            </MainLayout>
          } />
          
          {/* Thank you page */}
          <Route path="/thankyou" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ThankYouPage />
            </Suspense>
          } />
          
          {/* Coming soon page */}
          <Route path="/coming-soon" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ComingSoon />
            </Suspense>
          } />
          
          {/* 404/Catch-all route */}
<Route path="*" element={
  <MainLayout hideHeaderFooter={true}> {/* Hide header/footer for 404 */}
    <Suspense fallback={<LoadingSpinner />}>
      <NotFound />
    </Suspense>
  </MainLayout>
} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;