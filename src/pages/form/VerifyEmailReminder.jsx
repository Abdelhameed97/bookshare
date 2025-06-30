// ✅ VerifyEmailReminder.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/bookshare-logo.png";
import api from "../../api/auth";
import { useLocation } from "react-router-dom"; // 🟡 تأكد من استيراد useLocation

const VerifyEmailReminder = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setStatus("Please enter your email address.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await api.post("/resend-verification-email-by-email", { email });
      setStatus("Verification email sent successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4 text-center" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="d-flex justify-content-center mb-3">
          <img src={logo} alt="BookShare" style={{ width: "100px" }} />
        </div>

        <FaEnvelopeOpenText size={60} className="text-primary mb-3" />
        <h4 className="fw-bold">Verify Your Email</h4>
        <p className="text-muted small mb-3">
          We’ve sent a verification link to your email address.<br />
          Didn’t get the email?
        </p>

        {/* ✅ Toggle Button to show/hide form */}
        <button
          className="btn btn-link text-decoration-none mb-3"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Form" : "Resend Verification Email"}
        </button>

        {/* ✅ Animated Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {status && (
                <div
                  className={`alert ${
                    status.includes("successfully") ? "alert-success" : "alert-danger"
                  } py-2`}
                >
                  {status}
                </div>
              )}

              <button
                className="btn btn-outline-primary w-100 mb-2"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Resending...
                  </>
                ) : (
                  "Send Verification Link"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Link to="/" className="btn btn-light border w-100">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailReminder;
