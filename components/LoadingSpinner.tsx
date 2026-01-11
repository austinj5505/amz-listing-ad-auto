
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fas fa-robot text-blue-600 text-xl"></i>
      </div>
    </div>
  );
};
