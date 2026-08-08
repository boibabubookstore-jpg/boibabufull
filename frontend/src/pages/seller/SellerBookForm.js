import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { BOOK_CATEGORIES } from '../../constants/categories';
import { LANGUAGES } from '../../constants/languages';
import {
  BookOpenIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SellerBookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingBook, setExistingBook] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  const categories = BOOK_CATEGORIES;

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await api.get(`/api/seller/books/${id}`);
      const book = response.data;
      setExistingBook(book);
      
      // Populate form with existing data
      Object.keys(book).forEach(key => {
        if (key !== 'images' && key !== '_id') {
          setValue(key, book[key]);
        }
      });
      
      if (book.images) {
        setImages(book.images.map(img => 
          img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${img}`
        ));
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to load book details');
      navigate('/seller/books');
    }
  }, [id, setValue, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchBookDetails();
    }
  }, [isEdit, fetchBookDetails]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Store actual files for upload
    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // Also remove from selected files if it's a new file
    if (index >= (existingBook?.images?.length || 0)) {
      const fileIndex = index - (existingBook?.images?.length || 0);
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Append price and stock as numbers
      formData.append('price', parseFloat(data.price));
      formData.append('stock', parseInt(data.stock));
      
      if (data.pages) {
        formData.append('pages', parseInt(data.pages));
      }
      
      if (data.publishedDate) {
        formData.append('publishedDate', new Date(data.publishedDate).toISOString());
      }
      
      if (data.tags) {
        const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tags));
      }

      // Append existing images (URLs)
      if (existingBook?.images) {
        const existingImages = images.filter(img => typeof img === 'string' && img.startsWith('http'));
        if (existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(existingImages));
        }
      }

      // Append new image files
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      if (isEdit) {
        await api.post(`/api/seller/book-requests/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Book update request submitted successfully!');
      } else {
        await api.post('/api/seller/book-requests', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Book request submitted successfully!');
      }

      navigate('/seller/book-requests');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpenIcon className="h-6 w-6 text-primary-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Update Book Request' : 'Add New Book Request'}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit 
              ? 'Submit an update request for your existing book. Admin approval required.'
              : 'Submit a new book for admin approval before it appears on the website.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.author ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('author', { required: 'Author is required' })}
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide a detailed description of the book..."
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('stock', { 
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock must be non-negative' }
                })}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                {...register('isbn')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                {...register('publisher')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                {...register('pages')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                {...register('language')}
                defaultValue="English"
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                {...register('publishedDate')}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload book images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </div>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., bestseller, award-winning, classic"
              {...register('tags')}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add relevant tags to help customers find your book
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/seller/book-requests')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : (isEdit ? 'Submit Update Request' : 'Submit Book Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerBookForm;