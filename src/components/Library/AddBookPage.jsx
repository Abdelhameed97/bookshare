import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  Save, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Navbar from '../HomePage/Navbar';
import Footer from '../HomePage/Footer';

const AddBookPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    rental_price: '',
    category_id: '',
    status: 'available'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }
    
    fetchCategories();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const bookData = {
        ...formData,
        price: parseFloat(formData.price),
        rental_price: formData.rental_price ? parseFloat(formData.rental_price) : null
      };

      await api.post('/books', bookData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Book Added!',
        text: 'Your book has been added successfully.',
        timer: 2000
      });

      navigate('/dashboard');

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add book';
      Swal.fire({
        icon: 'error',
        title: 'Add Failed',
        text: message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '40px 15px',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            borderBottom: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <Link to="/dashboard" style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Add New Book</h1>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280'
            }}>Add a new book to your library collection</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>Book Information</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '8px'
                }}>
                  <BookOpen size={18} />
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.title ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Enter book title"
                  required
                />
                {errors.title && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.title}</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '8px'
                }}>
                  <BookOpen size={18} />
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.description ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                  placeholder="Enter book description"
                  rows="4"
                  required
                />
                {errors.description && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.description}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4b5563',
                    marginBottom: '8px'
                  }}>
                    <DollarSign size={18} />
                    Sale Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.price ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                  {errors.price && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.price}</span>}
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4b5563',
                    marginBottom: '8px'
                  }}>
                    <DollarSign size={18} />
                    Rental Price
                  </label>
                  <input
                    type="number"
                    name="rental_price"
                    value={formData.rental_price}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Leave empty if not available for rent
                  </small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4b5563',
                    marginBottom: '8px'
                  }}>
                    <BookOpen size={18} />
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.category_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.category_id}</span>}
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#4b5563',
                    marginBottom: '8px'
                  }}>
                    <AlertCircle size={18} />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px',
              marginTop: '30px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <Link to="/dashboard" style={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#e5e7eb',
                color: '#374151'
              }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                {loading ? 'Adding...' : (
                  <>
                    <Save size={18} />
                    Add Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddBookPage; 