import React from 'react';
import { Spinner } from 'flowbite-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <Spinner size="xl" aria-label="Loading" className="text-blue-500" />
      {/* Alternatively, use FaSpinner for a custom icon: */}
      {/* <FaSpinner className="animate-spin text-5xl text-blue-500" /> */}
      <span className="text-lg text-gray-500 font-medium">Loading...</span>
    </div>
  );
};

export default LoadingScreen;