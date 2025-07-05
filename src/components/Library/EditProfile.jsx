import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import Swal from 'sweetalert2';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';
import './EditProfile.css';

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    location: '',
    national_id: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Memoize currentUser to prevent unnecessary re-renders
  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    // Load current user data
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone_number: currentUser.phone_number || '',
      location: currentUser.location || '',
      national_id: currentUser.national_id || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (e) => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone_number && !/^01[0-9]\d{8}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be a valid 11-digit Egyptian mobile number.';
    }

    // National ID validation (only if not set)
    if (!currentUser.national_id) {
      if (!formData.national_id.trim()) {
        newErrors.national_id = 'National ID is required';
      } else if (!/^\d{14}$/.test(formData.national_id)) {
        newErrors.national_id = 'National ID must be 14 digits.';
      }
    }

    // Password validation logic - modified for social media users
    const isChangingPassword = formData.new_password || formData.confirm_password || formData.current_password;
    const isSocialUser = currentUser.provider && currentUser.provider !== 'local';

    // If on the password tab, and fields are empty, but user clicks save, show errors.
    // Or if user has started filling any password field, enforce all fields.
    if ((activeTab === 'password' && !isChangingPassword && e?.type === 'submit') || isChangingPassword) {
      // For social media users, don't require current password
      if (!isSocialUser && !formData.current_password) {
        newErrors.current_password = 'Current password is required.';
      }

      if (!formData.new_password) {
        newErrors.new_password = 'New password is required.';
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = 'New password must be at least 6 characters.';
      }
      
      if (!formData.confirm_password) {
        newErrors.confirm_password = 'Please confirm your new password.';
      } else if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(e)) {
      return;
    }

    try {
      setLoading(true);
      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('Current user:', currentUser);
      console.log('Form data:', formData);
      console.log('Token:', localStorage.getItem('token'));

      // Prepare FormData for file upload
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone_number', formData.phone_number);
      form.append('location', formData.location);
      if (!currentUser.national_id && formData.national_id) {
        form.append('national_id', formData.national_id);
      }
      if (formData.new_password) {
        form.append('password', formData.new_password);
        form.append('password_confirmation', formData.confirm_password);
        // Only send current_password if user is not from social media
        if (!currentUser.provider || currentUser.provider === 'local') {
          form.append('current_password', formData.current_password);
        }
      }
      // Laravel: use POST with _method=PUT for file upload
      form.append('_method', 'PUT');
      // Use fetch directly for multipart/form-data
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: form
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      // Update localStorage with new user data and owner.logo
      const updatedUser = { ...currentUser, ...data.data };
      if (data.data.owner) {
        updatedUser.owner = data.data.owner;
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Notify Navbar to update
      window.dispatchEvent(new Event('storage'));
      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        timer: 2000
      });
      setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
    } catch (error) {
      console.error('=== PROFILE UPDATE ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        console.error('Validation errors:', validationErrors);
        const errorMessages = Object.values(validationErrors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      
      // Specifically check for incorrect current password error
      if (error.response?.data?.errors?.current_password) {
        Swal.fire({
          icon: 'error',
          title: 'Incorrect Password',
          text: error.response.data.errors.current_password[0],
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!currentUser) {
    return null;
  }

  const isSocialUser = currentUser.provider && currentUser.provider !== 'local';

  return (
    <>
      <Navbar />
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          <div className="profile-header">
            <h1>Edit Profile</h1>
            <p>Update your library owner profile information</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {activeTab === 'personal' && (
              <div className="form-section">
                <h2>Personal Information</h2>
                
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={18} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={18} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email address"
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">
                    <Phone size={18} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={errors.phone_number ? 'error' : ''}
                    placeholder="Enter your phone number (e.g., 01012345678)"
                  />
                  {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <MapPin size={18} />
                    Address
                  </label>
                  <textarea
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="national_id">
                    الرقم القومي (National ID)
                  </label>
                  {currentUser.national_id ? (
                    <input
                      type="text"
                      id="national_id"
                      name="national_id"
                      value={formData.national_id}
                      readOnly
                      className="readonly"
                    />
                  ) : (
                    <input
                      type="text"
                      id="national_id"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleInputChange}
                      className={errors.national_id ? 'error' : ''}
                      placeholder="Enter your 14-digit National ID"
                      maxLength={14}
                    />
                  )}
                  {errors.national_id && <span className="error-message">{errors.national_id}</span>}
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="form-section">
                <h2>Change Password</h2>
                {isSocialUser && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                      <strong>Social Media Account:</strong> Since you signed up with {currentUser.provider}, 
                      you can set a new password without entering your current password.
                    </p>
                  </div>
                )}
                <p className="section-description">
                  Leave blank if you don't want to change your password. 
                  New password must be at least 6 characters long.
                </p>
                
                {!isSocialUser && (
                  <div className="form-group">
                    <label htmlFor="current_password">
                      <Eye size={18} />
                      Current Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="current_password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleInputChange}
                        className={errors.current_password ? 'error' : ''}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.current_password && <span className="error-message">{errors.current_password}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="new_password">
                    <Eye size={18} />
                    New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className={errors.new_password ? 'error' : ''}
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.new_password && <span className="error-message">{errors.new_password}</span>}
                  {formData.new_password && formData.new_password.length < 6 && (
                    <small style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      Password must be at least 6 characters
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">
                    <Eye size={18} />
                    Confirm New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={errors.confirm_password ? 'error' : ''}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
                  {formData.new_password && formData.confirm_password && formData.new_password !== formData.confirm_password && (
                    <small style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      Passwords do not match
                    </small>
                  )}
                  {formData.new_password && formData.confirm_password && formData.new_password === formData.confirm_password && formData.new_password.length >= 6 && (
                    <small style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      ✓ Passwords match
                    </small>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <div className="loading-spinner"></div>
                <div className="btn-content">
                  <Save size={18} />
                  <span>Save Changes</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile; 