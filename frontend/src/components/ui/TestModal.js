import React from 'react';

const TestModal = ({ isOpen, onClose }) => {
  console.log('TestModal render:', { isOpen });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6">
          <h2 className="text-xl font-bold mb-4">Test Modal</h2>
          <p className="mb-4">This is a test modal to verify modal functionality.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestModal;