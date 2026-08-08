import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/currency';

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: ''
  });

  // Fetch coupons
  const { data: couponData, isLoading } = useQuery(
    ['adminCoupons', currentPage, searchTerm],
    () => {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm
      });
      return api.get(`/api/coupons/admin?${params}`).then(res => res.data);
    },
    {
      keepPreviousData: true,
      onError: (error) => {
        toast.error('Failed to fetch coupons');
      }
    }
  );

  // Create/Update coupon mutation
  const saveCouponMutation = useMutation(
    (couponData) => {
      if (editingCoupon) {
        return api.put(`/api/coupons/${editingCoupon._id}`, couponData);
      } else {
        return api.post(`/api/coupons`, couponData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCoupons');
        toast.success(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully`);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save coupon');
      }
    }
  );

  // Delete coupon mutation
  const deleteCouponMutation = useMutation(
    (couponId) => {
      return api.delete(`/api/coupons/${couponId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCoupons');
        toast.success('Coupon deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  );

  // Toggle coupon status mutation
  const toggleCouponMutation = useMutation(
    (couponId) => {
      return api.patch(`/api/coupons/${couponId}/toggle`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCoupons');
        toast.success('Coupon status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update coupon status');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: ''
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const couponData = {
      ...formData,
      value: parseFloat(formData.value),
      minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
    };

    saveCouponMutation.mutate(couponData);
  };

  const handleDelete = (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  const coupons = couponData?.coupons || [];
  const pagination = couponData?.pagination || {};

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Coupon Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="form-input"
                      placeholder="SAVE10"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-input"
                    placeholder="Get 10% off on your order"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="form-input"
                      min="0"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === 'percentage' && (
                    <div>
                      <label className="form-label">Max Discount (₹)</label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="form-label">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      className="form-input"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Valid From *</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveCouponMutation.isLoading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saveCouponMutation.isLoading ? 'Saving...' : (editingCoupon ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="font-medium text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{coupon.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      coupon.type === 'percentage' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : coupon.usedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCouponMutation.mutate(coupon._id)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {coupon.isActive ? (
                          <>
                            <EyeIcon className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;