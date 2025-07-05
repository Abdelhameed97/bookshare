import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  Save, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import Swal from 'sweetalert2';
import Navbar from '../HomePage/Navbar';

const AddBookPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    genre: '',
    educational_level: '',
    condition: 'new',
    price: '',
    rental_price: '',
    category_id: '',
    status: 'available',
    quantity: 1,
    isbn: '',
    
    pages: '',
    images: [],
    tax: '',
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
      const response = await apiService.get('/categories');
      // Backend returns { categories: [...] } structure
      const categoriesData = response.data?.categories || response.data?.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
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
    setFormData(prev => {
      let updated = { ...prev, [name]: value };
      if (name === 'price') {
        const priceVal = parseFloat(value) || 0;
        updated.tax = (priceVal * 0.1).toFixed(2);
      }
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB max
      
      if (!isValidType) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: `${file.name} is not a valid image file. Please use JPEG, PNG, JPG, or GIF.`
        });
      }
      
      if (!isValidSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: `${file.name} is too large. Maximum size is 2MB.`
        });
      }
      
      return isValidType && isValidSize;
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
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

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (formData.pages && parseInt(formData.pages) <= 0) {
      newErrors.pages = 'Pages must be a positive number';
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

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('educational_level', formData.educational_level);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('tax', formData.tax);
      formDataToSend.append('rental_price', formData.rental_price || '');
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('pages', formData.pages);
      formDataToSend.append('user_id', currentUser.id);

      // Add images
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      // Use direct API call with FormData
      const response = await apiService.post('/books', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Book Added Successfully!',
        text: `${formData.title} has been added to your library.`,
        timer: 3000,
        showConfirmButton: false
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        author: '',
        genre: '',
        educational_level: '',
        condition: 'new',
        price: '',
        rental_price: '',
        category_id: '',
        status: 'available',
        quantity: 1,
        isbn: '',
        pages: '',
        images: [],
        tax: '',
      });
      setErrors({});

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
          }} className="header-container">
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
            }} className="back-link">
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

          <form onSubmit={handleSubmit} style={{ padding: '30px' }} className="form-container">
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
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.author ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Enter book author"
                  required
                />
                {errors.author && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.author}</span>}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-grid">
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
                    Tax (10%)
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      background: '#f3f4f6',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Calculated automatically as 10% of price
                  </small>
                </div>
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
                    <BookOpen size={18} />
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
                    <BookOpen size={18} />
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
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
                    placeholder="e.g., Fiction, Science, History"
                  />
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
                    <BookOpen size={18} />
                    Educational Level
                  </label>
                  <select
                    name="educational_level"
                    value={formData.educational_level}
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
                    <option value="">Select level</option>
                    <option value="Children">Children</option>
                    <option value="Teen">Teen</option>
                    <option value="Young Adult">Young Adult</option>
                    <option value="Adult">Adult</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>
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
                    <BookOpen size={18} />
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
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
                    placeholder="e.g., 978-0-7475-3269-9"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    International Standard Book Number (optional)
                  </small>
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
                    <BookOpen size={18} />
                    Pages
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.pages ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="e.g., 320"
                    min="1"
                  />
                  {errors.pages && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.pages}</span>}
                  <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Number of pages (optional)
                  </small>
                </div>
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
                    <AlertCircle size={18} />
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
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
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
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
                    <BookOpen size={18} />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.quantity ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#1f2937',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="1"
                    min="1"
                    required
                  />
                  {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '5px' }}>{errors.quantity}</span>}
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
                    {categories && categories.length > 0 ? categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    )) : (
                      <option value="" disabled>No categories available</option>
                    )}
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

            {/* Image Upload Section */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>Book Images</h2>
              
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
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    transition: 'all 0.2s ease'
                  }}
                />
                <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                  You can upload multiple images. Maximum file size: 2MB. Supported formats: JPEG, PNG, JPG, GIF
                </small>
              </div>

              {/* Display selected images */}
              {formData.images.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '15px'
                  }}>Selected Images ({formData.images.length})</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    {formData.images.map((image, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                        <div style={{
                          padding: '8px',
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></div>
                    Adding Book...
                  </>
                ) : (
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

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .form-container {
            padding: 20px !important;
          }
          
          .header-container {
            padding: 20px !important;
          }
          
          .back-link {
            position: static !important;
            transform: none !important;
            margin-bottom: 15px !important;
            justify-content: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .form-container {
            padding: 15px !important;
          }
          
          .header-container {
            padding: 15px !important;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default AddBookPage; 