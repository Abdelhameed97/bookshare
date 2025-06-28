import { useState } from 'react';
import api from '../../api/auth';
import logo from '../../assets/bookshare-logo.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setErrors({});

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus(response.data.message);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setStatus('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="BookShare Logo"
            style={{ width: '80px', marginBottom: '10px' }}
          />
          <h4 className="mb-0">Forgot Your Password?</h4>
          <small className="text-muted">Enter your email to reset it</small>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Send Reset Link
          </button>
        </form>

        {status && (
          <div className="alert alert-info mt-3 text-center">{status}</div>
        )}
      </div>
    </div>
  );
}
