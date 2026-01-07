// src/components/Services.jsx
import React from "react";
import "./Services.css";
import image from "../images/shirtshang.jpg";
import image2 from "../images/irononly.jpg";
import image3 from "../images/dryclean.jpg";
import image4 from "../images/leather.jpg";
import image5 from "../images/shoes.jpg";
import image6 from "../images/bedding.jpg";
import image7 from "../images/repair.jpg";
import image8 from "../images/servicewash.jpg";

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
    description: "We offer delicate dry cleaning for suits, dresses, and other specialty items.",
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
    description: "Comforters, bedsheets, pillow covers, curtains — all freshly washed.",
    image: image6,
  },
  {
    id: 6,
    title: "Shoes & Bags",
    description: "Full care service for your shoes, handbags, and accessories.",
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
    description: "Drop your everyday laundry — we'll wash, dry, and fold it for you.",
    image: image8,
  },
];

const Services = () => {
  return (
    <>
      <section className="services-section" id="services">
        <div className="container">
          <h2 className="services-heading">Our Services</h2>
          <p className="services-subheading">
            Premium laundry and dry cleaning solutions — fresh, crisp, and cared for with perfection.
          </p>
          <div className="services-grid">
            {services.map((service) => (
              <div
                key={service.id}
                className="service-card"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <div className="service-overlay">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button className="learn-more-btn">Know More</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;