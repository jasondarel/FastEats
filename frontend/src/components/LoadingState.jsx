import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col md:flex-row bg-yellow-50 min-h-screen">
      <main className="flex-1 p-5 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-4 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    </div>
  );
};

export default LoadingState;
