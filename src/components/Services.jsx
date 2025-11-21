// src/components/Services.jsx
import React from "react";
import "./Services.css";
import image from "../images/shirtshang.webp";
import image2 from "../images/irononly.webp";
import image3 from "../images/dryclean.webp";
import image4 from "../images/leather.webp";
import image5 from "../images/shoes.webp";
import image6 from "../images/bedding.webp";
import image7 from "../images/repair.webp";
import image8 from "../images/servicewash.webp";

const services = [
  {
    id: 1,
    title: "Cloth Clean & Iron",
    description: "We professionally clean and press your clothes with care and precision.",
    image: image,
  },
  {
    id: 2,
    title: "Iron Only",
    description: "Need just a perfect press? We iron everything to crisp, clean standards.",
    image: image2,
  },
  {
    id: 3,
    title: "Dry Cleaning",
    description: "Delicate dry cleaning for suits, dresses, and specialty items.",
    image: image3,
  },
  {
    id: 4,
    title: "Leather & Suede",
    description: "Careful cleaning for leather jackets, suede items, and more.",
    image: image4,
  },
  {
    id: 5,
    title: "Bedding & Household",
    description: "Comforters, bedsheets, curtains — all freshly washed.",
    image: image6,
  },
  {
    id: 6,
    title: "Shoes & Bags",
    description: "Full care service for shoes, handbags, and accessories.",
    image: image5,
  },
  {
    id: 7,
    title: "Repair & Alteration",
    description: "Stitching, hemming, zip repairs and clothing alterations.",
    image: image7,
  },
  {
    id: 8,
    title: "Service Wash",
    description: "Drop your laundry — we wash, dry, and fold it for you.",
    image: image8,
  },
];

const Services = () => {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="services-heading">Our Services</h2>
        <p className="services-subheading">
          Premium laundry and dry cleaning solutions — fresh, crisp, and cared for with perfection.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div
                className="service-image"
                style={{ backgroundImage: `url(${service.image})` }}
              ></div>

              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
