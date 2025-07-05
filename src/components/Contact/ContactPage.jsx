import React, { useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaGlobe } from "react-icons/fa";
import { BsTelephoneFill } from "react-icons/bs";
import { sendContactMessage } from "../../api/contact";
import "../../style/ContactPage.css";
import Swal from "sweetalert2"; // ✅ SweetAlert2

const ContactPage = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await sendContactMessage(formData);
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Your message has been sent successfully.",
        confirmButtonColor: "#4B6BFB",
      });
      setFormData({ subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to send message. Please make sure you're logged in.",
        confirmButtonColor: "#e3342f",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className='contact-section'>
      <div className='container'>
        {/* Header */}
        <div className='row justify-content-center'>
          <div className='col-12 text-center'>
            <h1 className='contact-title'>Contact Us</h1>
          </div>
        </div>

        {/* Cards */}
        <div className='row justify-content-center gap-4 mb-5'>
          {/* Address */}
          <div className='col-md-2'>
            <div className='contact-card'>
              <div className='icon-circle'>
                <FaMapMarkerAlt size={30} style={{ color: "#4B6BFB" }} />
              </div>
              <h6 className='contact-info-title'>Address:</h6>
              <p className='contact-info-text'>198 Street, Menya, Egypt</p>
            </div>
          </div>

          {/* Phone */}
          <div className='col-md-2'>
            <div className='contact-card'>
              <div className='icon-circle'>
                <BsTelephoneFill size={30} style={{ color: "#4B6BFB" }} />
              </div>
              <h6 className='contact-info-title'>Phone:</h6>
              <p className='contact-info-text'>+1235 2355 98</p>
            </div>
          </div>

          {/* Email */}
          <div className='col-md-2'>
            <div className='contact-card'>
              <div className='icon-circle'>
                <FaEnvelope size={30} style={{ color: "#4B6BFB" }} />
              </div>
              <h6 className='contact-info-title'>Email:</h6>
              <p className='contact-info-text'>bookshare@gmail.com</p>
            </div>
          </div>

          {/* Website */}
          <div className='col-md-2'>
            <div className='contact-card'>
              <div className='icon-circle'>
                <FaGlobe size={30} style={{ color: "#4B6BFB" }} />
              </div>
              <h6 className='contact-info-title'>Website:</h6>
              <p className='contact-info-text'>yoursite.com</p>
            </div>
          </div>
        </div>

        {/* Map + Form */}
        <div className='row g-0 justify-content-center mt-4'>
          {/* Map */}
          <div className='col-md-6'>
            <div
              className='map-container'
              style={{
                backgroundImage:
                  "url('https://www.shutterstock.com/image-photo/hand-show-icon-address-phone-600nw-2475999141.jpg')",
              }}
            ></div>
          </div>

          {/* Form */}
          <div className='col-md-6'>
            <div className='form-container'>
              <div className='p-5'>
                <h3 className='form-title text-center'>Send us a Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className='mb-3'>
                    <label className='form-label'>SUBJECT</label>
                    <input
                      type='text'
                      className='form-control'
                      name='subject'
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder='Subject'
                      required
                    />
                  </div>
                  <div className='mb-4'>
                    <label className='form-label'>MESSAGE</label>
                    <textarea
                      className='form-control'
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      rows='5'
                      placeholder='Message'
                      required
                    ></textarea>
                  </div>
                  <div className='text-center'>
                    <button
                      type='submit'
                      className='submit-button'
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
