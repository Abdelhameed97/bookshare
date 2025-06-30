import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import logo from "../../assets/bookshare-logo.png"; // 🟡 تأكد من المسار

const EmailVerified = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setToken(token);

      toast.success("🎉 Email verified successfully!", {
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/"); // أو profile/dashboard
      }, 3000);
    } else {
      toast.error("❌ Verification failed. No token found.", {
        position: "top-center",
      });
      navigate("/login");
    }
  }, [navigate, setToken]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="text-center bg-white p-4 shadow rounded-4">
        {/* 🟡 اللوجو */}
        <img
          src={logo}
          alt="BookShare Logo"
          style={{ width: "80px", marginBottom: "10px" }}
        />

        <h3 className="text-success fw-bold">Email Verified ✅</h3>
        <p className="text-muted mb-0">
          You’ll be redirected to your account shortly...
        </p>
      </div>
    </div>
  );
};

export default EmailVerified;
