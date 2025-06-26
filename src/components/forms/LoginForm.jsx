// LoginForm.jsx

import { useState } from "react";
import { login } from "../../api/auth";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/bookshare-logo.png";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle, FaGithub, FaFacebook, FaLinkedin } from "react-icons/fa";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setToken } = useAuth();

  const baseURL = process.env.REACT_APP_API_URL;

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
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsSubmitting(true);

    setTouched({ email: true, password: true });

    if (validateForm()) {
      try {
        const res = await login(form);
        setUser(res.data.data);
        setToken(res.data.access_token);
        navigate("/");
      } catch (err) {
        setServerError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const isValid = (field) => touched[field] && !errors[field] && form[field];

  const handleSocialLogin = (provider) => {
    window.location.href = `${baseURL}/auth/${provider}/redirect`;
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
                className='img-fluid mb-3'
                style={{
                  maxWidth: "100px",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <h2 className='mt-2 text-primary fw-bold'>Welcome Back</h2>
              <p className='text-muted'>Login to continue sharing books</p>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              {serverError && (
                <div className='alert alert-danger alert-dismissible fade show mb-3 py-2'>
                  {serverError}
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setServerError("")}
                  />
                </div>
              )}

              <div className='mb-3'>
                <div className='form-floating'>
                  <input
                    name='email'
                    type='email'
                    id='email'
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    } ${isValid("email") ? "is-valid" : ""}`}
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder='Email Address'
                  />
                  <label htmlFor='email'>Email Address</label>
                  {errors.email && (
                    <div className='invalid-feedback d-flex align-items-center'>
                      <FaTimes className='me-1' /> {errors.email}
                    </div>
                  )}
                  {isValid("email") && (
                    <div className='valid-feedback d-flex align-items-center'>
                      <FaCheck className='me-1' /> Looks good!
                    </div>
                  )}
                </div>
              </div>

              <div className='mb-1'>
                <div className='form-floating'>
                  <input
                    name='password'
                    type='password'
                    id='password'
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    } ${isValid("password") ? "is-valid" : ""}`}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder='Password'
                  />
                  <label htmlFor='password'>Password</label>
                  {errors.password && (
                    <div className='invalid-feedback d-flex align-items-center'>
                      <FaTimes className='me-1' /> {errors.password}
                    </div>
                  )}
                  {isValid("password") && (
                    <div className='valid-feedback d-flex align-items-center'>
                      <FaCheck className='me-1' /> Secure password!
                    </div>
                  )}
                </div>
              </div>

              <div className='d-flex justify-content-end mb-3'>
                <Link
                  to='/forgot-password'
                  className='small text-decoration-none'
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type='submit'
                className='btn btn-primary w-100 py-2 fw-bold'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                      aria-hidden='true'
                    ></span>
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className='d-flex align-items-center justify-content-center mt-3'>
              <hr className='flex-grow-1' />
              <span className='px-2 text-muted small'>OR</span>
              <hr className='flex-grow-1' />
            </div>

            {/* Social Media Login */}
            <div className='text-center'>
              <p className='fw-semibold text-muted'>
                🔐 Login quickly using your social accounts
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

                <button
                  className='btn rounded-circle d-flex justify-content-center align-items-center text-white'
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "#0A66C2",
                    border: "1px solid #0A66C2",
                  }}
                  type='button'
                  onClick={() => handleSocialLogin("linkedin")}
                >
                  <FaLinkedin />
                </button>
              </div>
            </div>
            <p className='text-center mb-0 text-muted small'>
              Don't have an account?{" "}
              <Link to='/register' className='text-primary fw-bold'>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
