// src/components/Contact.jsx
import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  // EmailJS configuration
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'ironingboy', // Get from EmailJS dashboard
    TEMPLATE_ID: 'ibsupport', // Get from EmailJS dashboard
    PUBLIC_KEY: 'NUeGJRN_N2UJ1taWW' // Get from EmailJS dashboard
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear status message when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Send email using EmailJS
      const result = await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        form.current,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log('Email sent successfully:', result.text);
      
      // Success
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <div className="contact-badge">
            <i className="fas fa-headset"></i>
            <span>Get In Touch</span>
          </div>
          
          <h1 className="contact-title">
            We're Here to 
            <span className="highlight"> Help</span>
          </h1>
          
          <p className="contact-subtitle">
            Have questions or need assistance? Reach out to us and we'll get back to you promptly.
          </p>
        </div>

        {/* Quick Support Stats */}
        <div className="contact-stats">
          <div className="contact-stat-item">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">24h</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="contact-stat-item">
            <div className="stat-icon">
              <i className="fas fa-phone"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">7 Days</div>
              <div className="stat-label">Support Available</div>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="contact-stat-item">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">100%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <div className="form-card">
              <div className="form-header">
                <div className="form-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="form-title-section">
                  <h3>Send us a Message</h3>
                  <p>Fill out the form below and we'll get back to you</p>
                </div>
              </div>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="success-message">
                  <div className="message-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="message-content">
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for contacting us. We'll get back to you shortly.</p>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="error-message">
                  <div className="message-icon">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="message-content">
                    <h4>Something went wrong</h4>
                    <p>Please try again or contact us directly via email/phone.</p>
                  </div>
                </div>
              )}
              
              <form 
                ref={form}
                className="contact-form" 
                onSubmit={handleSubmit}
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <div className="input-wrapper">
                      <i className="fas fa-user"></i>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                      />
                    </div>
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <div className="input-wrapper">
                      <i className="fas fa-envelope"></i>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                      />
                    </div>
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <div className="input-wrapper">
                    <i className="fas fa-phone"></i>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+44 20 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <div className="input-wrapper">
                    <i className="fas fa-tag"></i>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? 'error' : ''}
                    />
                  </div>
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message *</label>
                  <div className="textarea-wrapper">
                    <i className="fas fa-comment"></i>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Please provide details about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={errors.message ? 'error' : ''}
                    ></textarea>
                  </div>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="button-spinner"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>
                  
                  <div className="form-note">
                    <i className="fas fa-info-circle"></i>
                    <span>We typically respond within 24 hours</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-wrapper">
            <div className="info-card">
              <div className="info-header">
                <div className="info-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h3>Other Ways to Reach Us</h3>
                <p>Choose your preferred way to get in touch</p>
              </div>
              
<div className="contact-methods">
  <div className="contact-method">
    <div className="method-icon">
      <div className="icon-circle">
        <i className="fas fa-phone-alt"></i>
      </div>
    </div>
    <div className="method-content">
      <h4>Call Us</h4>
      <p className="method-detail">+44 02031231010</p>
      <p className="method-note">Speak directly with our customer care team</p>
    </div>
  </div>
  
  <div className="contact-method">
    <div className="method-icon">
      <div className="icon-circle">
        <i className="fas fa-envelope"></i>
      </div>
    </div>
    <div className="method-content">
      <h4>Email Us</h4>
      <p className="method-detail">support@ironingboy.com</p>
      <p className="method-note">Get detailed assistance via email anytime</p>
    </div>
  </div>
  
  <div className="contact-method">
    <div className="method-icon">
      <div className="icon-circle">
        <i className="fas fa-headset"></i>
      </div>
    </div>
    <div className="method-content">
      <h4>24/7 Support</h4>
      <p className="method-detail">Always Available</p>
      <p className="method-note">Round-the-clock assistance for your convenience</p>
    </div>
  </div>
</div>
              
              <div className="quick-tips">
                <h4>Quick Tips for Faster Support:</h4>
                <ul>
                  <li>Include your order number if applicable</li>
                  <li>Be specific about your inquiry</li>
                  <li>Check our FAQ section first</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;