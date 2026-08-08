import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  KeyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  // Forgot password mutation
  const forgotPasswordMutation = useMutation(
    (data) => {
      return api.post(`/api/auth/forgot-password`, data);
    },
    {
      onSuccess: (response, variables) => {
        setEmail(variables.email);
        setStep('reset');
        toast.success('OTP sent to your email!');
        
        // OTP is not logged for security reasons
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send reset OTP');
      }
    }
  );

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    (data) => {
      return api.post(`/api/auth/reset-password`, data);
    },
    {
      onSuccess: () => {
        toast.success('Password reset successfully! You can now login with your new password.');
        setStep('email');
        setEmail('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      }
    }
  );

  const onForgotSubmit = (data) => {
    forgotPasswordMutation.mutate(data);
  };

  const onResetSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    resetPasswordMutation.mutate({
      email,
      otp: data.otp,
      newPassword: data.newPassword
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <KeyIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {step === 'email' ? 'Forgot Password?' : 'Reset Your Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' 
            ? 'Enter your email address and we\'ll send you a reset OTP'
            : 'Enter the OTP sent to your email and your new password'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'email' ? (
            // Forgot Password Form
            <form onSubmit={handleSubmit(onForgotSubmit)} className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {forgotPasswordMutation.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset OTP'
                )}
              </button>
            </form>
          ) : (
            // Reset Password Form
            <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>OTP sent to:</strong> {email}
                </p>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  className={`form-input text-center text-lg font-mono tracking-widest ${
                    resetErrors.otp ? 'border-red-500' : ''
                  }`}
                  {...registerReset('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'OTP must be 6 digits'
                    }
                  })}
                  onChange={(e) => {
                    // Only allow numbers
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                />
                {resetErrors.otp && (
                  <p className="text-red-500 text-sm mt-1">{resetErrors.otp.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-input ${resetErrors.newPassword ? 'border-red-500' : ''}`}
                  {...registerReset('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                {resetErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{resetErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className={`form-input ${resetErrors.confirmPassword ? 'border-red-500' : ''}`}
                  {...registerReset('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                  }}
                  className="flex-1 btn-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {resetPasswordMutation.isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;