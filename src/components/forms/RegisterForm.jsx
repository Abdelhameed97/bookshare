import React, { useState } from "react";
import logo from "../../assets/bookshare-logo.png";
import { register } from "../../api/auth";
import useAuth from "../../hooks/useAuth";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";


const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    national_id: "",
    role: "client"
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();


  const validateField = (name, value) => {
    switch (name) {
      case "name": return value.trim() ? "" : "Name is required";
      case "email": return value.includes("@") ? "" : "Email is invalid";
      case "password": return value.length >= 6 ? "" : "Minimum 6 characters";
      case "password_confirmation": return value === form.password ? "" : "Passwords don't match";
      case "phone_number": return value.match(/^01[0-9]{9}$/) ? "" : "Invalid Egyptian number";
      case "national_id": return value.match(/^[0-9]{14}$/) ? "" : "Must be 14 digits";
      case "role": return ["client", "owner"].includes(value) ? "" : "Select a valid role";
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, form[name]) }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsSubmitting(true);
    
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validateForm()) {
      try {
        const res = await register(form);
        setUser(res.data.data);
        setToken(res.data.access_token);
        navigate("/"); // 👈 navigate to home after successful register
      } catch (err) {
        setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const isValid = (field) => touched[field] && !errors[field] && form[field];

  return (
    <div className="position-absolute top-50 start-50 translate-middle w-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-xl-6 p-4 border rounded-4 shadow bg-white">
            <div className="text-center mb-3">
              <img 
                src={logo} 
                alt="BookShare Logo" 
                className="mb-2"
                style={{ width: "90px", filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))" }}
              />
              <h2 className="text-primary fw-bold">Join BookShare</h2>
              <p className="text-muted small">Create your account to start sharing books</p>
            </div>
            
            <form noValidate onSubmit={handleSubmit}>
              {serverError && (
                <div className="alert alert-danger alert-dismissible fade show mb-2 py-2">
                  {serverError}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setServerError("")}
                  />
                </div>
              )}
              
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`form-control ${errors.name ? "is-invalid" : ""} ${isValid("name") ? "is-valid" : ""}`}
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your Name"
                    />
                    <label htmlFor="name">Full Name</label>
                    {errors.name && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.name}
                      </div>
                    )}
                    {isValid("name") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Looks good!
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""} ${isValid("email") ? "is-valid" : ""}`}
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Email Address"
                    />
                    <label htmlFor="email">Email Address</label>
                    {errors.email && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.email}
                      </div>
                    )}
                    {isValid("email") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Looks good!
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="tel"
                      name="phone_number"
                      id="phone_number"
                      className={`form-control ${errors.phone_number ? "is-invalid" : ""} ${isValid("phone_number") ? "is-valid" : ""}`}
                      value={form.phone_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Phone Number"
                    />
                    <label htmlFor="phone_number">Phone Number</label>
                    {errors.phone_number && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.phone_number}
                      </div>
                    )}
                    {isValid("phone_number") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Looks good!
                      </div>
                    )}
                    <small className="text-muted">Egyptian numbers only (01XXXXXXXXX)</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      name="national_id"
                      id="national_id"
                      className={`form-control ${errors.national_id ? "is-invalid" : ""} ${isValid("national_id") ? "is-valid" : ""}`}
                      value={form.national_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="National ID"
                    />
                    <label htmlFor="national_id">National ID</label>
                    {errors.national_id && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.national_id}
                      </div>
                    )}
                    {isValid("national_id") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Looks good!
                      </div>
                    )}
                    <small className="text-muted">14 digits only</small>
                  </div>
                </div>
              </div>
              
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""} ${isValid("password") ? "is-valid" : ""}`}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Password"
                    />
                    <label htmlFor="password">Password</label>
                    {errors.password && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.password}
                      </div>
                    )}
                    {isValid("password") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Secure password!
                      </div>
                    )}
                    <small className="text-muted">At least 6 characters</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      className={`form-control ${errors.password_confirmation ? "is-invalid" : ""} ${isValid("password_confirmation") ? "is-valid" : ""}`}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Confirm Password"
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback d-flex align-items-center">
                        <FaTimes className="me-1" /> {errors.password_confirmation}
                      </div>
                    )}
                    {isValid("confirmPassword") && (
                      <div className="valid-feedback d-flex align-items-center">
                        <FaCheck className="me-1" /> Passwords match!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Account Type</label>
                <div className="d-flex gap-2">
                  <div className="form-check flex-grow-1">
                    <input
                      className="form-check-input visually-hidden"
                      type="radio"
                      name="role"
                      id="clientRole"
                      value="client"
                      checked={form.role === "client"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <label className="form-check-label w-100" htmlFor="clientRole">
                      <div className={`p-2 border rounded text-center ${form.role === "client" ? "border-primary bg-primary bg-opacity-10" : "border-secondary"}`}>
                        <h6 className="mb-0">Book Lover</h6>
                        <small className="text-muted">Borrow books</small>
                      </div>
                    </label>
                  </div>
                  <div className="form-check flex-grow-1">
                    <input
                      className="form-check-input visually-hidden"
                      type="radio"
                      name="role"
                      id="ownerRole"
                      value="owner"
                      checked={form.role === "owner"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <label className="form-check-label w-100" htmlFor="ownerRole">
                      <div className={`p-2 border rounded text-center ${form.role === "owner" ? "border-primary bg-primary bg-opacity-10" : "border-secondary"}`}>
                        <h6 className="mb-0">Library Owner</h6>
                        <small className="text-muted">Share books</small>
                      </div>
                    </label>
                  </div>
                </div>
                {errors.role && (
                  <div className="invalid-feedback d-flex align-items-center mt-1">
                    <FaTimes className="me-1" /> {errors.role}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2 fw-bold mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : "Register Now"}
              </button>
              
              <p className="text-center mt-2 mb-0 text-muted small">
                Already have an account? <Link to="/login" className="text-primary fw-bold">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;