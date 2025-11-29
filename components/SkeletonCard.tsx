import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full animate-pulse">
      <div className="h-44 bg-gray-200 w-full relative">
        <div className="absolute top-3 right-3 w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="absolute bottom-3 left-3 w-12 h-6 bg-gray-300 rounded-md"></div>
      </div>
      <div className="p-4 flex flex-col space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-16 bg-gray-100 rounded-lg w-full"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;