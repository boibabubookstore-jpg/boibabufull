import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    (data) => {
      return api.post('/api/auth/reset-password', data);
    },
    {
      onSuccess: () => {
        toast.success('Password reset successfully! You can now login with your new password.');
        navigate('/login');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Password reset failed');
      }
    }
  );

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({
      token,
      newPassword: data.newPassword
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LockClosedIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className={`form-input pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Contains at least one uppercase letter</li>
                <li>• Contains at least one lowercase letter</li>
                <li>• Contains at least one number</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {resetPasswordMutation.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  Resetting Password...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  Reset Password
                </div>
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;