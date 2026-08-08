import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery(
    ['adminCategories', currentPage, searchTerm],
    () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      return api.get(`/api/categories/admin?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  // Create category mutation
  const createCategoryMutation = useMutation(
    (formData) => api.post('/api/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category created successfully');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create category');
      }
    }
  );

  // Update category mutation
  const updateCategoryMutation = useMutation(
    ({ id, formData }) => api.put(`/api/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category updated successfully');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update category');
      }
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    (id) => api.delete(`/api/categories/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setShowModal(true);
    
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description);
      setValue('sortOrder', category.sortOrder);
      setValue('isActive', category.isActive);
      setImagePreview(category.image?.url || '');
    } else {
      reset();
      setImagePreview('');
      setSelectedImage(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSelectedImage(null);
    setImagePreview('');
    reset();
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category._id);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  const categories = categoriesData?.categories || [];
  const pagination = categoriesData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize your books into categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 form-input"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Category Image */}
            <div className="h-32 bg-gray-100 relative">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TagIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Category Details */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-1 text-gray-400 hover:text-primary-600"
                    title="Edit Category"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Category"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Sort Order: {category.sortOrder}</span>
                <span>Slug: {category.slug}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded ${
                  page === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name', { required: 'Category name is required' })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  {...register('description')}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="form-label">Category Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setSelectedImage(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  {...register('sortOrder', { valueAsNumber: true })}
                  defaultValue={0}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('isActive')}
                  defaultChecked={true}
                />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {createCategoryMutation.isLoading || updateCategoryMutation.isLoading
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;