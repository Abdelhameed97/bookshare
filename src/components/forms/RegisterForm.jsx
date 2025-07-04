import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import logo from "../../assets/bookshare-logo.png";
import { register } from "../../api/auth";
import useAuth from "../../hooks/useAuth";

const RegisterForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const role = location.state?.role;
  const validRoles = ["client", "owner"];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    national_id: "",
    role: validRoles.includes(role) ? role : "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!form.role) {
      navigate("/get-started", { replace: true });
    }
  }, [form.role, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Name is required";
      case "email":
        return value.includes("@") ? "" : "Email is invalid";
      case "password":
        return value.length >= 6 ? "" : "Minimum 6 characters";
      case "password_confirmation":
        return value === form.password ? "" : "Passwords don't match";
      case "phone_number":
        return /^01[0-9]{9}$/.test(value)
          ? ""
          : "Invalid Egyptian number (01XXXXXXXXX)";
      case "national_id":
        return /^[0-9]{14}$/.test(value) ? "" : "Must be 14 digits";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = (field) => touched[field] && !errors[field] && form[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
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
        navigate("/verify-email", { state: { email: form.email } });
        console.log("Registration successful:", res.data);
      } catch (err) {
        setServerError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (!form.role) return;
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}/redirect?role=${form.role}`;
  };

  return (
    <div className='d-flex justify-content-center align-items-center min-vh-100'>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-12 col-md-10 col-lg-7 col-xl-6 p-3 border rounded-4 shadow bg-white'>
            <div className='text-center mb-1'>
              <img
                src={logo}
                alt='BookShare Logo'
                className='mb-2 img-fluid'
                style={{
                  maxWidth: "100px",
                  height: "auto",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <h2 className='text-primary fw-bold'>Join BookShare</h2>
              <p className='text-muted small'>
                {form.role === "owner"
                  ? "Register as a Library Owner to share books"
                  : "Register as a Book Lover to borrow books"}
              </p>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              {serverError && (
                <div className='alert alert-danger alert-dismissible fade show mb-1 py-2'>
                  {serverError}
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setServerError("")}
                  />
                </div>
              )}

              {/* NAME + EMAIL */}
              <div className='row g-2 mb-1'>
                {["name", "email"].map((field, idx) => (
                  <div className='col-md-6' key={idx}>
                    <div className='form-floating'>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        id={field}
                        className={`form-control ${
                          errors[field] ? "is-invalid" : ""
                        } ${isValid(field) ? "is-valid" : ""}`}
                        value={form[field]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={field}
                        autoComplete={field}
                      />
                      <label htmlFor={field}>
                        {field === "name" ? "Full Name" : "Email Address"}
                      </label>
                      {errors[field] && (
                        <div className='invalid-feedback d-flex align-items-center'>
                          <FaTimes className='me-1' /> {errors[field]}
                        </div>
                      )}
                      {isValid(field) && (
                        <div className='valid-feedback d-flex align-items-center'>
                          <FaCheck className='me-1' /> Looks good!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* PHONE + NATIONAL ID */}
              <div className='row g-2 mb-1'>
                {["phone_number", "national_id"].map((field, idx) => (
                  <div className='col-md-6' key={idx}>
                    <div className='form-floating'>
                      <input
                        type='text'
                        name={field}
                        id={field}
                        className={`form-control ${
                          errors[field] ? "is-invalid" : ""
                        } ${isValid(field) ? "is-valid" : ""}`}
                        value={form[field]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={field}
                      />
                      <label htmlFor={field}>
                        {field === "phone_number"
                          ? "Phone Number"
                          : "National ID"}
                      </label>
                      {errors[field] && (
                        <div className='invalid-feedback d-flex align-items-center'>
                          <FaTimes className='me-1' /> {errors[field]}
                        </div>
                      )}
                      {isValid(field) && (
                        <div className='valid-feedback d-flex align-items-center'>
                          <FaCheck className='me-1' /> Looks good!
                        </div>
                      )}
                      <small className='text-muted'>
                        {field === "phone_number"
                          ? "Egyptian number (01XXXXXXXXX)"
                          : "14 digits only"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              {/* PASSWORD + CONFIRMATION */}
              <div className='row g-2 mb-1'>
                {[
                  {
                    name: "password",
                    show: showPassword,
                    toggle: setShowPassword,
                  },
                  {
                    name: "password_confirmation",
                    show: showConfirmPassword,
                    toggle: setShowConfirmPassword,
                  },
                ].map(({ name, show, toggle }, idx) => (
                  <div className='col-md-6' key={idx}>
                    <div className='form-floating position-relative'>
                      <input
                        type={show ? "text" : "password"}
                        name={name}
                        id={name}
                        className={`form-control ${
                          errors[name] ? "is-invalid" : ""
                        } ${isValid(name) ? "is-valid" : ""}`}
                        value={form[name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={name}
                        autoComplete='new-password'
                      />
                      <label htmlFor={name}>
                        {name === "password" ? "Password" : "Confirm Password"}
                      </label>
                      <span
                        className='position-absolute top-50 end-0 translate-middle-y me-3'
                        style={{ cursor: "pointer", zIndex: 2 }}
                        onClick={() => toggle((prev) => !prev)}
                      >
                        {show ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      {errors[name] && (
                        <div className='invalid-feedback d-flex align-items-center'>
                          <FaTimes className='me-1' /> {errors[name]}
                        </div>
                      )}
                      {isValid(name) && (
                        <div className='valid-feedback d-flex align-items-center'>
                          <FaCheck className='me-1' /> Password OK
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Change role link */}
              <div className='text-center'>
                <small className='text-muted'>
                  Want to change your role?{" "}
                  <Link to='/get-started' className='text-primary'>
                    Choose another account type
                  </Link>
                </small>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className='btn btn-primary w-100 py-2 fw-bold mt-3'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Creating Account...
                  </>
                ) : (
                  "Register Now"
                )}
              </button>
              <div className='d-flex align-items-center justify-content-center mt-3'>
                <hr className='flex-grow-1' />
                <span className='px-2 text-muted small'>OR</span>
                <hr className='flex-grow-1' />
              </div>
              {/* Social Media Login */}
              <div className='text-center'>
                <p className='fw-semibold text-muted'>
                  🔐 Register quickly using your social accounts
                </p>

                <div className='d-flex flex-wrap justify-content-center gap-3'>
                  <button
                    className='btn btn-outline-danger rounded-circle d-flex justify-content-center align-items-center'
                    style={{ width: "45px", height: "45px" }}
                    type='button'
                    onClick={() => handleSocialLogin("google")}
                  >
                    <FaGoogle />
                  </button>

                  <button
                    className='btn btn-outline-dark rounded-circle d-flex justify-content-center align-items-center'
                    style={{ width: "45px", height: "45px" }}
                    type='button'
                    onClick={() => handleSocialLogin("github")}
                  >
                    <FaGithub />
                  </button>

                  <button
                    className='btn btn-outline-primary rounded-circle d-flex justify-content-center align-items-center'
                    style={{ width: "45px", height: "45px" }}
                    type='button'
                    onClick={() => handleSocialLogin("facebook")}
                  >
                    <FaFacebook />
                  </button>
                </div>
              </div>

              <p className='text-center text-muted small mb-0'>
                Already have an account?{" "}
                <Link to='/login' className='text-primary fw-bold'>
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
