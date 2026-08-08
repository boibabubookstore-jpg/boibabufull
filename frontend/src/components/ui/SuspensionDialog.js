import React from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const SuspensionDialog = ({ isOpen, onClose, suspensionReason, suspendedAt }) => {
  if (!isOpen) return null;

  const handleContactSupport = () => {
    window.open('mailto:support@boibabu.com?subject=Account Suspension Review Request&body=Hello BoiBabu Support Team,%0D%0A%0D%0AI believe my account has been suspended incorrectly. Please review my case.%0D%0A%0D%0ASuspension Reason: ' + encodeURIComponent(suspensionReason || 'Not specified') + '%0D%0ASuspended Date: ' + encodeURIComponent(suspendedAt ? new Date(suspendedAt).toLocaleDateString() : 'Not specified') + '%0D%0A%0D%0APlease let me know what steps I can take to resolve this issue.%0D%0A%0D%0AThank you.', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-red-900">Account Suspended</h2>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-gray-700 text-lg mb-2">
              Your account has been suspended and you cannot access the platform.
            </p>
          </div>

          {/* Suspension Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Reason:</label>
                <p className="text-sm text-gray-900 mt-1">
                  {suspensionReason || 'No specific reason provided'}
                </p>
              </div>
              {suspendedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Suspended On:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(suspendedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Appeal Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Think this is a mistake?
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              If you believe your account was suspended incorrectly, you can contact our customer service team for a review.
            </p>
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Contact Customer Service
            </button>
          </div>

          {/* What happens next */}
          <div className="text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Our team will review your case within 2-3 business days</li>
              <li>You'll receive an email with the review outcome</li>
              <li>If the suspension is lifted, you'll regain full access</li>
              <li>You can provide additional information via email</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspensionDialog;