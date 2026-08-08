import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        landmark: user?.address?.landmark || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'India'
      }
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm();

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => {
      return api.put(`/api/auth/profile`, data);
    },
    {
      onSuccess: (response) => {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => {
      return api.put(`/api/auth/change-password`, data);
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        resetPassword();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    }
  );

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      reset(); // Reset form to original values
    }
    setIsEditing(!isEditing);
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${errors.name ? 'border-red-500' : ''}`}
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${errors.email ? 'border-red-500' : ''}`}
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                      {...register('phone')}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Address Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.street')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">Landmark</label>
                      <input
                        type="text"
                        placeholder="Near hospital, school, etc."
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.landmark')}
                      />
                      <p className="text-xs text-gray-500 mt-1">Landmark helps delivery person locate your address easily</p>
                    </div>

                    <div>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.city')}
                      />
                    </div>

                    <div>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.state')}
                      />
                    </div>

                    <div>
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.zipCode')}
                      />
                    </div>

                    <div>
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                        {...register('address.country')}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateProfileMutation.isLoading ? (
                        <>
                          <div className="spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="max-w-md">
                  <div>
                    <label className="form-label">Current Password *</label>
                    <input
                      type="password"
                      className={`form-input ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      className={`form-input ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      className={`form-input ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                      {...registerPassword('confirmPassword', { required: 'Please confirm your password' })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {changePasswordMutation.isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="spinner"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;