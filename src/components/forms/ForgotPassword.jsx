import { useState } from 'react';
import api from '../../api/auth';

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
      setStatus(response.data.message); // Laravel بيرجع "message" مش "status"
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        console.log(error.response.data);
      } else {
        setStatus('Something went wrong. Please try again.');
        console.log(error.response.data);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Send Reset Link
        </button>
      </form>

      {status && <p style={{ marginTop: '1rem', color: 'green' }}>{status}</p>}
    </div>
  );
}
