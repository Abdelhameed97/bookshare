import React, { useState } from 'react';

const CategoryForm = ({ category, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'general',
    description: category?.description || '',
    color: category?.color || '#199A8E',
    icon: category?.icon || 'Book'
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const colorOptions = [
    { value: '#199A8E', label: 'Teal' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#EF4444', label: 'Red' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#10B981', label: 'Green' },
    { value: '#8B5CF6', label: 'Violet' }
  ];

  const iconOptions = [
    { value: 'Book', label: 'Book' },
    { value: 'Heart', label: 'Heart' },
    { value: 'Star', label: 'Star' },
    { value: 'Palette', label: 'Palette' },
    { value: 'Music', label: 'Music' },
    { value: 'Code', label: 'Code' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
              Category Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#199A8E]'
              }`}
              placeholder="Enter category name"
            />
            {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
              Type
            </label>
            <input
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
              placeholder="e.g., Fiction, Science"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <div key={color.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`color-${color.value}`}
                    name="color"
                    value={color.value}
                    checked={formData.color === color.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`color-${color.value}`}
                    className={`w-full h-10 rounded-lg cursor-pointer flex items-center justify-center ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-[#199A8E]'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {formData.color === color.value && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="icon">
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
            >
              {iconOptions.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
              placeholder="Brief description of the category"
            ></textarea>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
          <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: formData.color + '20' }}>
            <div className="bg-white p-3 rounded-lg shadow mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: formData.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinecap="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{formData.name || 'Category Name'}</h4>
              <p className="text-gray-600 text-sm">{formData.description || 'Category description'}</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#199A8E] hover:bg-[#157d74] text-white font-medium py-2 px-6 rounded-lg shadow-md transition flex items-center disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Save Category'
            )}
          </button>
        </div>

        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Category saved successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default CategoryForm;