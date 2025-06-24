// SocialCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import logo from "../assets/bookshare-logo.png";
import { getUser } from "../api/auth";

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

      getUser()
        .then((response) => {
          console.log("User from API:", response.data);

          // Navigate based on role
          if (response.data.role === "owner") {
            navigate("/dashboard");
          } else if (response.data.role === "client") {
            navigate("/");
          } else {
            navigate("/login");
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className='callback-container d-flex flex-column align-items-center justify-content-center vh-100'>
      <div className='callback-box text-center p-4 shadow-sm rounded'>
        <Spinner animation='border' variant='primary' className='mb-3' />
        <img src={logo} alt='BookShare Logo' width={200} />
        <h5>Welcome to BookShare</h5>
        <p className='text-muted'>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default SocialCallback;
