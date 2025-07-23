/* eslint-disable react/prop-types */

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="text-center py-10 px-4 bg-white rounded-lg shadow w-full max-w-6xl">
      <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
      <p className="text-gray-600">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;