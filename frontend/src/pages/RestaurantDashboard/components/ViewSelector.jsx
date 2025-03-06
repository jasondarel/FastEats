import React from "react";

const ViewSelector = ({
  viewMode,
  selectedMonth,
  toggleViewMode,
  handleMonthChange,
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="flex items-center">
      <button
        onClick={toggleViewMode}
        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors cursor-pointer"
      >
        {viewMode === "monthly"
          ? "Switch to Daily View"
          : "Switch to Monthly View"}
      </button>

      {viewMode === "daily" && (
        <div className="relative ml-4">
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="border border-amber-300 rounded-md px-3 py-2 bg-white text-amber-900 cursor-pointer"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
