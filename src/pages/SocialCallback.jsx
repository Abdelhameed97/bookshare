import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import "../style/SocialCallback.css";
import logo from "../assets/bookshare-logo.png";
import api from "../api/auth"; // لازم يكون فيه export default

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

      // ✅ checkAuth بعد حفظ التوكن
      const checkAuth = async () => {
        try {
          const res = await api.get("/user");
          console.log("✅ User info:", res.data);

          // ✅ توجيه حسب الدور بعد التأكد من المصادقة
          if (role === "owner") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("❌ Not authenticated:", err);
          navigate("/login");
        }
      };

      checkAuth();
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
