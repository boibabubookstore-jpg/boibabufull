import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { LANGUAGES } from '../../constants/languages';
import { BOOK_CATEGORIES } from '../../constants/categories';

const AdminBookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      featured: false,
      bestseller: false,
      newArrival: false
    }
  });

  // Fetch book data for editing
  const { isLoading } = useQuery(
    ['book', id],
    () => {
      return api.get(`/api/books/${id}`).then(res => res.data);
    },
    {
      enabled: isEditing,
      onSuccess: (data) => {
        // Populate form with existing data
        Object.keys(data).forEach(key => {
          if (key === 'publishedDate' && data[key]) {
            setValue(key, new Date(data[key]).toISOString().split('T')[0]);
          } else if (key !== 'images' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
            setValue(key, data[key]);
          }
        });
        
        // Set existing images for preview
        if (data.images && data.images.length > 0) {
          setImagePreview(data.images.map(img => ({ 
            url: img.startsWith ? (img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${img}`) : img.url || img, 
            isExisting: true 
          })));
        }
      }
    }
  );

  // Fetch categories - with fallback to static categories
  const { data: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    async () => {
      const baseURL = process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app';
      const url = `${baseURL}/api/categories`;
      console.log('Fetching categories from:', url);
      
      try {
        const response = await api.get(url);
        console.log('Categories response status:', response.status);
        console.log('Categories response data:', response.data);
        console.log('Categories count:', response.data?.length);
        return response.data;
      } catch (error) {
        console.error('Categories fetch error:', error);
        console.error('Error response:', error.response);
        throw error;
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      onError: (error) => {
        console.error('React Query onError - Failed to fetch categories:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        // Don't show error toast, we'll fall back to static categories
      },
      onSuccess: (data) => {
        console.log('React Query onSuccess - Categories loaded successfully:', data);
        console.log('Categories array length:', data?.length);
      },
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  );

  // Use API categories if available, otherwise fall back to static categories
  const categories = React.useMemo(() => {
    if (apiCategories && Array.isArray(apiCategories) && apiCategories.length > 0) {
      return apiCategories.map(cat => ({ _id: cat._id, name: cat.name }));
    }
    // Fallback to static categories
    return BOOK_CATEGORIES.map(name => ({ _id: name, name }));
  }, [apiCategories]);

  // Create/Update book mutation
  const bookMutation = useMutation(
    (formData) => {
      if (isEditing) {
        return api.put(`/api/admin/books/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return api.post(`/api/admin/books`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBooks');
        toast.success(`Book ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/admin/books');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} book`);
        setIsSubmitting(false);
      }
    }
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreview.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, { url: e.target.result, isExisting: false }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const imageToRemove = imagePreview[index];
    
    if (imageToRemove.isExisting) {
      // Remove from preview only
      setImagePreview(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from both preview and selected files
      const newImageIndex = imagePreview.slice(0, index).filter(img => !img.isExisting).length;
      setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setImagePreview(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    
    // Append form fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    // Append new images
    selectedImages.forEach(image => {
      formData.append('images', image);
    });

    bookMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/books')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Book' : 'Add New Book'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update book information and inventory' : 'Add a new book to your inventory'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="form-label">Author *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.author ? 'border-red-500' : ''}`}
                    {...register('author', { required: 'Author is required' })}
                  />
                  {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <div className="flex gap-2">
                    <select
                      className={`form-input flex-1 ${errors.category ? 'border-red-500' : ''}`}
                      {...register('category', { required: 'Category is required' })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => queryClient.invalidateQueries('categories')}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      disabled={categoriesLoading}
                      title="Refresh categories"
                    >
                      {categoriesLoading ? '...' : '↻'}
                    </button>
                  </div>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                  {categoriesLoading && (
                    <p className="text-blue-600 text-sm mt-1">
                      Loading categories...
                    </p>
                  )}
                  {categoriesError && !categoriesLoading && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Using default categories (API unavailable)
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Description *</label>
                  <textarea
                    rows={4}
                    className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                    {...register('description', { required: 'Description is required' })}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="225.00"
                    className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                    {...register('price', { 
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="form-label">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="299.00"
                    className="form-input"
                    {...register('originalPrice', {
                      min: { value: 0, message: 'Original price must be positive' }
                    })}
                  />
                  {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice.message}</p>}
                </div>

                <div>
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    className={`form-input ${errors.stock ? 'border-red-500' : ''}`}
                    {...register('stock', { 
                      required: 'Stock quantity is required',
                      min: { value: 0, message: 'Stock must be non-negative' }
                    })}
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">ISBN</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('isbn')}
                  />
                </div>

                <div>
                  <label className="form-label">Publisher</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('publisher')}
                  />
                </div>

                <div>
                  <label className="form-label">Published Date</label>
                  <input
                    type="date"
                    className="form-input"
                    {...register('publishedDate')}
                  />
                </div>

                <div>
                  <label className="form-label">Pages</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    {...register('pages', {
                      min: { value: 1, message: 'Pages must be positive' }
                    })}
                  />
                  {errors.pages && <p className="text-red-500 text-sm mt-1">{errors.pages.message}</p>}
                </div>

                <div>
                  <label className="form-label">Language</label>
                  <select
                    className="form-input"
                    {...register('language')}
                    defaultValue="English"
                  >
                    {LANGUAGES.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book Images</h2>
              
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer">
                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Max 5 images)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Book Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book Status</h2>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register('featured')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Book</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register('bestseller')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Bestseller</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register('newArrival')}
                  />
                  <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Book' : 'Create Book'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/books')}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminBookForm;