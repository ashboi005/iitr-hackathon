import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
  );
};

export default LoadingScreen;
