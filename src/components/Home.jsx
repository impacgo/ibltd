// src/components/Home.jsx
import React, { useRef } from "react";
import Hero from "./Hero";
import ServiceAreas from "./ServiceAreas";

const Home = () => {
  const serviceRef = useRef(null);

  const scrollToServiceAreas = () => {
    // safe check and smooth scroll to the actual DOM node
    if (serviceRef.current) {
      serviceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="home">
      {/* pass scroll handler into Hero */}
      <Hero onCheckService={scrollToServiceAreas} />

      {/* other sections can remain as-is; keep id for backward compatibility */}
      <section id="services" ref={serviceRef}>
        <ServiceAreas />
      </section>
      
      {/* Add other sections of your main page here */}
    </div>
  );
};

export default Home;
