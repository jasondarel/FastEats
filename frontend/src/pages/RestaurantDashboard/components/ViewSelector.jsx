/* eslint-disable react/prop-types */

const ViewSelector = ({ viewMode, selectedMonth, toggleViewMode, handleMonthChange }) => {
  // List of months for the dropdown
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return (
    <div className="flex items-center space-x-4">
      {/* Toggle button for monthly/daily view */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            viewMode === "monthly"
              ? "bg-amber-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
          onClick={toggleViewMode}
        >
          Monthly
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            viewMode === "daily"
              ? "bg-amber-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
          onClick={toggleViewMode}
        >
          Daily
        </button>
      </div>
      
      {/* Month selector dropdown (only visible in daily view) */}
      {viewMode === "daily" && (
        <select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ViewSelector;