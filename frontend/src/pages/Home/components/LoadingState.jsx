import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col md:flex-row bg-yellow-50 min-h-screen">
      <main className="flex-1 p-5 flex items-center justify-center">
        <div className="text-yellow-600 font-semibold text-lg">Loading...</div>
      </main>
    </div>
  );
};

export default LoadingState;
