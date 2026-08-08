import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EmailVerificationPage = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  
  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');
  const isPending = location.state?.isPending || false;
  const customMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm();

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setCanResend(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Verify OTP mutation
  const verifyOTPMutation = useMutation(
    (data) => {
      return api.post(`/api/auth/verify-otp`, data);
    },
    {
      onSuccess: (response) => {
        const successMessage = response.data.message || (isPending ? 
          'Registration completed successfully!' : 
          'Email verified successfully!');
        toast.success(successMessage);
        
        // Auto-login user after verification
        loginWithToken(response.data.token, response.data.user);
        
        // Redirect based on user role
        const { role } = response.data.user;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/');
        }
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Verification failed';
        setError('otp', { message });
        toast.error(message);
      }
    }
  );

  // Resend OTP mutation
  const resendOTPMutation = useMutation(
    (data) => {
      return api.post(`/api/auth/resend-otp`, data);
    },
    {
      onSuccess: () => {
        toast.success('OTP sent successfully!');
        setCanResend(false);
        setTimeLeft(60); // 60 seconds cooldown
        clearErrors('otp');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to resend OTP';
        toast.error(message);
      }
    }
  );

  const onSubmit = (data) => {
    verifyOTPMutation.mutate({
      email,
      otp: data.otp
    });
  };

  const handleResendOTP = () => {
    if (canResend) {
      resendOTPMutation.mutate({ email });
    }
  };

  // Redirect if no email provided
  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access</h2>
            <p className="text-gray-600 mb-6">Please register or login to access this page.</p>
            <Link
              to="/register"
              className="btn-primary inline-block"
            >
              Go to Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <EnvelopeIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isPending ? 'Complete Your Registration' : 'Verify Your Email'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {customMessage || (isPending ? 
            "We've sent a 6-digit OTP to complete your account setup" :
            "We've sent a 6-digit OTP to verify your email"
          )}
        </p>
        <p className="text-center text-sm font-medium text-primary-600">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="form-label flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Enter OTP Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                className={`form-input text-center text-lg font-mono tracking-widest ${
                  errors.otp ? 'border-red-500' : ''
                }`}
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits'
                  }
                })}
                onChange={(e) => {
                  // Only allow numbers
                  e.target.value = e.target.value.replace(/\D/g, '');
                  clearErrors('otp');
                }}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyOTPMutation.isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {verifyOTPMutation.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  {isPending ? 'Completing Registration...' : 'Verifying...'}
                </div>
              ) : (
                isPending ? 'Complete Registration' : 'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Didn't receive the OTP?
              </p>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendOTPMutation.isLoading}
                className={`text-sm font-medium ${
                  canResend && !resendOTPMutation.isLoading
                    ? 'text-primary-600 hover:text-primary-700 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {resendOTPMutation.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner-sm"></div>
                    Sending...
                  </div>
                ) : canResend ? (
                  'Resend OTP'
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Resend in {timeLeft}s
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• OTP expires in 5 minutes</li>
                      <li>• Maximum 3 attempts per 24 hours</li>
                      <li>• Check your spam folder if not received</li>
                      {isPending && <li>• Your account will be created after verification</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;