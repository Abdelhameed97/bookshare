import React from 'react';
import Navbar from "../components/HomePage/Navbar.jsx";
import Footer from "../components/HomePage/Footer.jsx";
import ContactPageContent from "../components/Contact/ContactPage.jsx";

const ContactPageWrapper = () => {
  return (
    <div>
        <Navbar />
        <ContactPageContent />
        <Footer />
    </div>
  );
};

export default ContactPageWrapper; 