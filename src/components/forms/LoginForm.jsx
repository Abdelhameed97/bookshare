import { useState } from "react";
import { login } from "../../api/auth";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/bookshare-logo.png";
import { FaCheck, FaTimes } from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return value.includes("@") ? "" : "Email is invalid";
      case "password":
        return value.length >= 6 ? "" : "Minimum 6 characters";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
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
    
    const allTouched = {};
    Object.keys(form).forEach(key => { allTouched[key] = true });
    setTouched(allTouched);

    if (validateForm()) {
      try {
        const res = await login(form);
        setUser(res.data.data);
        setToken(res.data.access_token);
        navigate("/"); // Navigate to home after successful login
      } catch (err) {
        setServerError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
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
          <div className="col-md-6 col-lg-5 p-4 border rounded-4 shadow bg-white">
            <div className="text-center mb-4">
              <img 
                src={logo} 
                alt="BookShare Logo" 
                className="mb-3"
                style={{ width: "100px", filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))" }}
              />
              <h2 className="mt-2 text-primary fw-bold">Welcome Back</h2>
              <p className="text-muted">Login to continue sharing books</p>
            </div>
            
            <form noValidate onSubmit={handleSubmit}>
              {serverError && (
                <div className="alert alert-danger alert-dismissible fade show mb-3 py-2">
                  {serverError}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setServerError("")}
                  />
                </div>
              )}

              <div className="mb-3">
                <div className="form-floating">
                  <input
                    name="email"
                    type="email"
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

              <div className="mb-4">
                <div className="form-floating">
                  <input
                    name="password"
                    type="password"
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

              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging In...
                  </>
                ) : "Login"}
              </button>
              
              <p className="text-center mt-3 mb-0 text-muted small">
                Don't have an account? <Link to="/register" className="text-primary fw-bold">Create Account</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;