// src/components/CareerPage.jsx
import React from "react";
import "./CareerSection.css";
import IMG1 from "../images/lmVan.webp";

const CareerPage = () => {
  return (
    <main className="career-page">

      {/* HERO (Full Premium) */}
      <section className="section hero-section">
        <div className="container hero-grid">
          <div className="hero-media media-card">
            <img src={IMG1} alt="" loading="lazy" />
          </div>

          <div className="hero-copy">
            <h1>Partner with IroningBoy</h1>
            <p className="lead">
              Transform your laundry business with the UK's fastest-growing pickup and delivery platform.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Become a Partner</button>
              <button className="btn btn-outline">Schedule a Call</button>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity */}
      <section className="section balanced">
        <div className="container split-grid">
          <div className="content">
            <h2>The Opportunity</h2>
            <h3>Growing Market Demand</h3>
            <p>The UK laundry and dry-cleaning market is experiencing unprecedented growth.</p>
            <p>Consumer spending on laundry services has grown by 23% since 2020.</p>
          </div>

          <div className="media media-card">
            <img src={IMG1} alt="" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Why Traditional */}
      <section className="section balanced">
        <div className="container">
          <h2>Why Traditional Models Are Struggling</h2>

          <div className="cards-grid">
            <article className="card">
              <h4>Declining Footfall</h4>
              <p>Customers don’t want to visit shops with limited hours.</p>
            </article>
            <article className="card">
              <h4>Operational Inefficiency</h4>
              <p>Capacity remains unused during off-peak times.</p>
            </article>
            <article className="card">
              <h4>Rising Competition</h4>
              <p>Online-first competitors are capturing market share.</p>
            </article>
          </div>

          <p className="highlight">
            The solution? Partner with a platform that brings customers directly to you.
          </p>
        </div>
      </section>

      {/* Meet IroningBoy */}
      <section className="section balanced">
        <div className="container split-grid reverse-on-mobile">
          <div className="media media-card tall-image">
            <img src={IMG1} alt="" loading="lazy" />
          </div>

          <div className="content">
            <h2>Meet IroningBoy</h2>
            <p>
              Connecting quality service providers with thousands of customers
              across the UK.
            </p>

            <div className="stats">
              <div className="stat">
                <h3>15K+</h3>
                <p>Active Customers</p>
              </div>
              <div className="stat">
                <h3>98%</h3>
                <p>Satisfaction Rate</p>
              </div>
              <div className="stat">
                <h3>24hr</h3>
                <p>Turnaround Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Steps */}
      <section className="section balanced">
        <div className="container">
          <h2>How the Partnership Works</h2>

          <div className="steps-grid">
            <div className="step"><div className="step-num">01</div><h4>Join Our Network</h4></div>
            <div className="step"><div className="step-num">02</div><h4>Receive Orders</h4></div>
            <div className="step"><div className="step-num">03</div><h4>You Handle Logistics</h4></div>
            <div className="step"><div className="step-num">04</div><h4>Focus on Quality</h4></div>
            <div className="step"><div className="step-num">05</div><h4>Get Paid</h4></div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section balanced">
        <div className="container">
          <h2>Your Benefits</h2>

          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-media"><img src={IMG1} alt="" /></div>
              <h4>Increased Revenue</h4>
              <p>Typically +30–40% within six months.</p>
            </div>

            <div className="benefit">
              <div className="benefit-media"><img src={IMG1} alt="" /></div>
              <h4>Better Utilisation</h4>
              <p>Fill gaps with steady workflow.</p>
            </div>

            <div className="benefit">
              <div className="benefit-media"><img src={IMG1} alt="" /></div>
              <h4>Zero Marketing Hassle</h4>
              <p>We bring the customers—you deliver quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Model */}
      <section className="section balanced">
        <div className="container split-grid">
          <div className="content">
            <h2>Transparent Partnership Model</h2>
            <p>We operate on a simple revenue share model.</p>

            <ul className="plain-list">
              <li>No upfront costs</li>
              <li>No long-term lock-in</li>
              <li>Weekly payouts</li>
            </ul>
          </div>

          <div className="media media-card small-image">
            <img src={IMG1} alt="" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section balanced">
        <div className="container">
          <h2>Success Stories</h2>

          <div className="testimonial-banner media-card">
            <img src={IMG1} alt="" />
          </div>

          <div className="testimonials-grid">
            <div className="testimonial"><h4>Sarah Mitchell</h4><p>“We doubled our revenue…”</p></div>
            <div className="testimonial"><h4>James Chen</h4><p>“Steady workflow enabled full-time staff…”</p></div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section final-cta">
        <div className="container cta-grid">
          <div className="content">
            <h2>Join the IroningBoy Family Today</h2>
            <p>Limited slots available in your area.</p>

            <div className="hero-actions">
              <button className="btn btn-primary">Become a Partner</button>
              <button className="btn btn-outline">Schedule a Call</button>
            </div>
          </div>

          <div className="media media-card tall-image">
            <img src={IMG1} alt="Handshake partnership" loading="lazy" />
          </div>
        </div>
      </section>

    </main>
  );
};

export default CareerPage;
