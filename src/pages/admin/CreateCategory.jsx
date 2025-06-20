import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryForm from '../../components/admin/CategoryForm';
import AdminLayout from '../../layouts/AdminLayout';

const CreateCategory = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create New Category</h1>
          <button 
            onClick={() => navigate('/admin/categories')}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Categories
          </button>
        </div>
        
        <CategoryForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </AdminLayout>
  );
};

export default CreateCategory;