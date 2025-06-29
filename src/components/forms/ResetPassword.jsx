import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/bookshare-logo.png";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const tokenParam = params.get("token");

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (!email) {
      setErrors({ email: ["Email is missing. Try again from the email link."] });
      return;
    }

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: ["Passwords do not match."] });
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/auth/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage("✅ Password reset successfully. Redirecting to login...");
      setPassword("");
      setPasswordConfirmation("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage("❌ Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            <div className="text-center mb-4">
              <img src={logo} alt="Logo" style={{ width: "80px", marginBottom: "10px" }} />
              <h4 className="fw-bold">Reset Your Password</h4>
            </div>

            {message && <div className="alert alert-info text-center">{message}</div>}

            {errors.email && (
              <div className="alert alert-danger text-center">{errors.email[0]}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                      errors.password ? "is-invalid" : password ? "is-valid" : ""
                    }`}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password[0]}</div>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`form-control ${
                      errors.password_confirmation
                        ? "is-invalid"
                        : passwordConfirmation && password === passwordConfirmation
                        ? "is-valid"
                        : ""
                    }`}
                    placeholder="Confirm new password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password_confirmation && (
                    <div className="invalid-feedback d-block">
                      {errors.password_confirmation[0]}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Reset Password
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          BookShare © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
