// // src/App.jsx
// import React, { useState, useEffect, Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
// import Header from './components/Header';
// import './App.css';
// import { AuthProvider } from './context/AuthContext';
// import LoadingSpinner from './components/LoadingSpinner';
// import ScrollToTop from './components/ScrollToTop';
// import ServicePricing from './components/ServicePricing';
// import Reviews from './components/Reviews';

// // Define API_BASE constant for backward compatibility component
// const API_BASE = "https://api.ironingboy.com";
// // Lazy load components
// const Hero = lazy(() => import('./components/Hero'));
// const Services = lazy(() => import('./components/Services'));
// const HowItWorks = lazy(() => import('./components/HowItWorks'));
// const Pricing = lazy(() => import('./components/Pricing'));
// const Testimonials = lazy(() => import('./components/Testimonials'));
// const FAQ = lazy(() => import('./components/FAQ'));
// const Contact = lazy(() => import('./components/Contact'));
// const Footer = lazy(() => import('./components/Footer'));
// const TotalPricing = lazy(() => import('./components/totalpricing'));
// const SearchResults = lazy(() => import('./components/SearchResults'));
// const ComingSoon = lazy(() => import('./components/ComingSoon'));
// const ServiceAreas = lazy(() => import('./components/ServiceAreas'));
// const AreaDetails = lazy(() => import("./components/AreaDetails"));
// const ServicePage = lazy(() => import("./components/ServicePage"));
// const AreaServicePage = lazy(() => import("./components/AreaServicePage"));
// const CategoryDetails = lazy(() => import("./components/CategoryDetails"));
// const Checkout = lazy(() => import('./components/Checkout'));
// const PersonalInfo = lazy(() => import("./components/PersonalInfo"));
// const QuickBooking = lazy(() => import("./components/QuickBooking"));
// const OrderHistory = lazy(() => import('./components/OrderHistory'));
// const ServiceDetail = lazy(() => import('./components/ServiceDetail'));
// const TermsPage = lazy(() => import("./components/TermsLink"));
// const ThankYouPage = lazy(() => import('./components/ThankYouPage'));
// const NotFound = lazy(() => import('./components/NotFound'));
// // Main Layout Component
// const MainLayout = ({ children, hideHeaderFooter = false }) => {
//   const location = useLocation();
  
//   // Scroll to top on route change
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location.pathname]);

//   return (
//     <div className="App">
//       {!hideHeaderFooter && <Header />}
//       <main className="main-content" id="main-content">
//         {children}
//       </main>
//       {!hideHeaderFooter && <Footer />}
//     </div>
//   );
// };

// // Page components
// const HomePage = () => (
//   <>
//     <Hero />
//     <Services />
//     <HowItWorks />
//     <Pricing />
//     <Testimonials />
//     <FAQ />
//     <Contact />
//   </>
// );

// const ServicesPage = () => <Services />;
// const PricingPage = () => <TotalPricing />;
// const HowItWorksPage = () => <HowItWorks />;
// const TestimonialsPage = () => <Testimonials />;
// const FAQPage = () => <FAQ />;
// const ContactPage = () => <Contact />;
// const AreasPage = () => <ServiceAreas />;
// const QuickBookingPage = () => <QuickBooking />;
// const ServiceDetailPage = () => <ServiceDetail />;

// // Create a wrapper for all pages that need the MainLayout
// const PageWrapper = ({ component: Component }) => (
//   <MainLayout>
//     <Suspense fallback={<LoadingSpinner />}>
//       <Component />
//     </Suspense>
//   </MainLayout>
// );

// function App() {
//   return (
//     <AuthProvider>
//       <Router basename="/">
//         <ScrollToTop />
        
//         <Routes>
//           {/* Home page */}
//           <Route path="/" element={<PageWrapper component={HomePage} />} />
          
//           {/* Static pages */}
//           <Route path="/services" element={<PageWrapper component={ServicesPage} />} />
//           <Route path="/pricing" element={<PageWrapper component={PricingPage} />} />
//           <Route path="/how-it-works" element={<PageWrapper component={HowItWorksPage} />} />
//           <Route path="/testimonials" element={<PageWrapper component={TestimonialsPage} />} />
//           <Route path="/faq" element={<PageWrapper component={FAQPage} />} />
//           <Route path="/contact" element={<PageWrapper component={ContactPage} />} />
//           <Route path="/areas" element={<PageWrapper component={AreasPage} />} />
//           <Route
//   path="/quick-booking"
//   element={
//     <MainLayout hideHeaderFooter>
//       <Suspense fallback={<LoadingSpinner />}>
//         <QuickBooking />
//       </Suspense>
//     </MainLayout>
//   }
// />

//           <Route path="/service-pricing" element={<ServicePricing />} />
//           <Route path="/Checkout" element={<Checkout/>}/>
//           <Route path="/reviews" element={<Reviews />} />
//           {/* Dynamic routes */}
          
//           {/* Area details - e.g., /areas/paddington */}
//           <Route path="/areas/:slug" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <AreaDetails />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Area service page - e.g., /areas/paddington/ironing */}
//           <Route path="/areas/:slug/:serviceSlug" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <AreaServicePage />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Category pages */}
//           <Route path="/category/:categorySlug" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <ServiceDetailPage />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Service pages */}
//           <Route path="/service/:serviceId" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <ServicePage />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* User pages */}
//           <Route path="/profile" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <PersonalInfo />
//               </Suspense>
//             </MainLayout>
//           } />
//           <Route path="/checkout" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <Checkout />
//               </Suspense>
//             </MainLayout>
//           } />
//           <Route path="/orders" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <OrderHistory />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Legal pages */}
//           <Route path="/terms" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <TermsPage />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Search */}
//           <Route path="/search" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <SearchResults />
//               </Suspense>
//             </MainLayout>
//           } />
          
//           {/* Thank you page */}
//           <Route path="/thankyou" element={
//             <Suspense fallback={<LoadingSpinner />}>
//               <ThankYouPage />
//             </Suspense>
//           } />
          
//           {/* Coming soon page */}
//           <Route path="/coming-soon" element={
//             <Suspense fallback={<LoadingSpinner />}>
//               <ComingSoon />
//             </Suspense>
//           } />
          
//           {/* 404/Catch-all route - MUST BE LAST */}
//           <Route path="*" element={
//             <MainLayout>
//               <Suspense fallback={<LoadingSpinner />}>
//                 <NotFound />
//               </Suspense>
//             </MainLayout>
//           } />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.jsx
import React, { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { Helmet, HelmetProvider } from "react-helmet-async";

import Header from "./components/Header";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import ServicePricing from "./components/ServicePricing";
import Reviews from "./components/Reviews";

/* -------------------- Lazy Loaded Components -------------------- */
const Hero = lazy(() => import("./components/Hero"));
const Services = lazy(() => import("./components/Services"));
const HowItWorks = lazy(() => import("./components/HowItWorks"));
const Pricing = lazy(() => import("./components/Pricing"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const FAQ = lazy(() => import("./components/FAQ"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));
const TotalPricing = lazy(() => import("./components/totalpricing"));
const SearchResults = lazy(() => import("./components/SearchResults"));
const ComingSoon = lazy(() => import("./components/ComingSoon"));
const ServiceAreas = lazy(() => import("./components/ServiceAreas"));
const AreaDetails = lazy(() => import("./components/AreaDetails"));
const ServicePage = lazy(() => import("./components/ServicePage"));
const AreaServicePage = lazy(() => import("./components/AreaServicePage"));
const CategoryDetails = lazy(() => import("./components/CategoryDetails"));
const Checkout = lazy(() => import("./components/Checkout"));
const PersonalInfo = lazy(() => import("./components/PersonalInfo"));
const QuickBooking = lazy(() => import("./components/QuickBooking"));
const OrderHistory = lazy(() => import("./components/OrderHistory"));
const ServiceDetail = lazy(() => import("./components/ServiceDetail"));
const TermsPage = lazy(() => import("./components/TermsLink"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const NotFound = lazy(() => import("./components/NotFound"));

/* -------------------- MAIN LAYOUT -------------------- */
const MainLayout = ({ children, hideHeaderFooter = false }) => {
  const location = useLocation();

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

/* -------------------- SEO META MANAGER -------------------- */
const MetaManager = () => {
  const { pathname } = useLocation();

  let title = "Ironing Boy | Professional Laundry & Ironing Services";
  let description =
    "Professional ironing and laundry services by Ironing Boy with doorstep pickup & delivery.";

  if (pathname === "/") {
    title = "Premium Ironing and Laundry Services | 50% OFF On 1st Order";
    description =
      "Professional ironing and laundry services by Ironing Boy. First booking 50% OFF, second 35% OFF, third 30% OFF. Doorstep pickup & delivery.";
  } else if (pathname === "/services") {
    title = "Laundry and Ironing Services | 50% OFF First Order";
    description =
      "Premium laundry and ironing services. First booking – 50% OFF, second – 35% OFF, third – 30% OFF. Easy online booking with doorstep pickup & delivery.";
  } else if (pathname === "/areas") {
    title = "Ironing & Laundry Services Near You | Check Areas";
    description =
      "Explore Ironing Boy service areas across London. We provide laundry and ironing services, laundry pickup, dry cleaning, and premium garment care near you.";
  } else if (pathname === "/pricing") {
    title = "Laundry Services Price | 50% OFF on First Order";
    description =
      "Check Ironing Boy laundry services price list including ironing and dry cleaning. Transparent pricing, premium care, and 50% OFF on your first order.";
  } else if (pathname === "/how-it-works") {
    title = "How It Works | Laundry & Ironing Service | Ironing Boy";
    description =
      "Learn how Ironing Boy works. Book online, schedule laundry pickup, get professional ironing and dry cleaning, and enjoy fast doorstep delivery.";
  } else if (pathname === "/faq") {
    title = "FAQs: Ironing & Laundry Service | Ironing Boy";
    description =
      "Get answers about Ironing Boy ironing & laundry service, including pricing, pickup, delivery, dry cleaning, and premium garment care.";
  } else if (pathname === "/quick-booking") {
    title = "Book Ironing and Laundry Service Now | 50% OFF on 1st Order";
    description =
      "Book ironing and laundry service online with Ironing Boy. Get 50% OFF on your 1st order with doorstep pickup, fast delivery, and premium care.";
  } else if (pathname === "/reviews") {
    title = "Customer Reviews | Ironing Boy";
    description =
      "Read genuine customer reviews for Ironing Boy ironing & laundry service. See what our clients say about our laundry, ironing, and dry cleaning services.";
  } else if (pathname.startsWith("/areas/")) {
    const area = pathname
      .split("/")[2]
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (l) => l.toUpperCase());

    title = `Laundry & Dry Cleaning Services in ${area} | Ironing Boy`;
    description = `Professional laundry and dry cleaning services in ${area}. Ironing Boy offers fast pickup, expert garment care, and affordable pricing. Book today!`;
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`https://www.ironingboy.com${pathname}`}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

/* -------------------- PAGE COMPOSITIONS -------------------- */
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

const PageWrapper = ({ component: Component }) => (
  <MainLayout>
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  </MainLayout>
);

/* -------------------- APP ROOT -------------------- */
function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <Router basename="/">
          <ScrollToTop />
          <MetaManager />

          <Routes>
            <Route path="/" element={<PageWrapper component={HomePage} />} />
            <Route path="/services" element={<PageWrapper component={Services} />} />
            <Route path="/pricing" element={<PageWrapper component={TotalPricing} />} />
            <Route path="/how-it-works" element={<PageWrapper component={HowItWorks} />} />
            <Route path="/testimonials" element={<PageWrapper component={Testimonials} />} />
            <Route path="/faq" element={<PageWrapper component={FAQ} />} />
            <Route path="/contact" element={<PageWrapper component={Contact} />} />
            <Route path="/areas" element={<PageWrapper component={ServiceAreas} />} />

            <Route
              path="/quick-booking"
              element={
                <MainLayout hideHeaderFooter>
                  <Suspense fallback={<LoadingSpinner />}>
                    <QuickBooking />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route path="/service-pricing" element={<ServicePricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/reviews" element={<Reviews />} />

            <Route
              path="/areas/:slug"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AreaDetails />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/areas/:slug/:serviceSlug"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AreaServicePage />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/category/:categorySlug"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ServiceDetail />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/service/:serviceId"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ServicePage />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <PersonalInfo />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/orders"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OrderHistory />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/terms"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TermsPage />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/search"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SearchResults />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/thankyou"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ThankYouPage />
                </Suspense>
              }
            />

            <Route
              path="/coming-soon"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ComingSoon />
                </Suspense>
              }
            />

            <Route
              path="*"
              element={
                <MainLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
