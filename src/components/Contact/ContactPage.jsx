import React, { useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { BsTelephoneFill } from 'react-icons/bs';
import emailjs from '@emailjs/browser';
import '../../style/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const templateParams = {
        to_email: 'rehabkamalabdelhamed@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        templateParams,
        'YOUR_PUBLIC_KEY'
      );

      alert('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <h1 className="contact-title">Contact Us</h1>
          </div>
          
          {/* Contact Info Cards */}
          <div className="row justify-content-center gap-4 mb-5">
            {/* Address Card */}
            <div className="col-md-2">
              <div className="contact-card">
                <div className="icon-circle">
                  <FaMapMarkerAlt size={30} style={{ color: "#4B6BFB" }} />
                </div>
                <h6 className="contact-info-title">Address:</h6>
                <p className="contact-info-text">198 Street ,<br/>Menya , Egypt</p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="col-md-2">
              <div className="contact-card">
                <div className="icon-circle">
                  <BsTelephoneFill size={30} style={{ color: "#4B6BFB" }} />
                </div>
                <h6 className="contact-info-title">Phone:</h6>
                <p className="contact-info-text">+ 1235 2355 98</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="col-md-2">
              <div className="contact-card">
                <div className="icon-circle">
                  <FaEnvelope size={30} style={{ color: "#4B6BFB" }} />
                </div>
                <h6 className="contact-info-title">Email:</h6>
                <p className="contact-info-text">bookshare@gmail.com</p>
              </div>
            </div>

            {/* Website Card */}
            <div className="col-md-2">
              <div className="contact-card">
                <div className="icon-circle">
                  <FaGlobe size={30} style={{ color: "#4B6BFB" }} />
                </div>
                <h6 className="contact-info-title">Website:</h6>
                <p className="contact-info-text">yoursite.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form and Map */}
          <div className="row g-0 justify-content-center mt-4">
            {/* Map Image */}
            <div className="col-md-6">
              <div className="map-container" style={{
                backgroundImage: "url('https://www.shutterstock.com/image-photo/hand-show-icon-address-phone-600nw-2475999141.jpg')"
              }}>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-md-6">
              <div className="form-container">
                <div className="p-5">
                  <h3 className="form-title text-center">Send us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">FULL NAME</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Name" 
                          required 
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email" 
                          required 
                        />
                      </div>
                </div>
                <div className="mb-3">
                      <label className="form-label">SUBJECT</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject" 
                        required 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">MESSAGE</label>
                      <textarea 
                        className="form-control" 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5" 
                        placeholder="Message" 
                        required
                      ></textarea>
                    </div>
                    <div className="text-center">
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={sending}
                      >
                        {sending ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default ContactPage;