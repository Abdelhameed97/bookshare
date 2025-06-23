// src/pages/SocialCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap"; // or use your own spinner
import "../style/SocialCallback.css"; // Ensure you have this CSS file for styling
import logo from "../assets/bookshare-logo.png";
const SocialCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // توجيه بعد 2 ثانية
      setTimeout(() => {
        navigate("/"); // أو "/owner-dashboard" لو عندك صفحات مختلفة
      }, 2000);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className='callback-container d-flex flex-column align-items-center justify-content-center vh-100'>
      <div className='callback-box text-center p-4 shadow-sm rounded'>
        <Spinner animation='border' variant='primary' className='mb-3' />
        <img
          src={logo}
          alt='BookShare Logo'
          className='logo mb-3'
          width={200}
        />
        <h5>Welcome to BookShare </h5>
        <p className='text-muted'>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default SocialCallback;
