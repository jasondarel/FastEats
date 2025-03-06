import React from "react";
import MonthlyCharts from "./MonthlyCharts";
import DailyCharts from "./DailyCharts";
import ViewSelector from "./ViewSelector";

const DashboardCharts = ({
  orders,
  viewMode,
  selectedMonth,
  toggleViewMode,
  handleMonthChange,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-amber-900">
          Performance Overview
        </h2>

        {/* View Selector Component */}
        <ViewSelector
          viewMode={viewMode}
          selectedMonth={selectedMonth}
          toggleViewMode={toggleViewMode}
          handleMonthChange={handleMonthChange}
        />
      </div>

      {viewMode === "monthly" ? (
        <MonthlyCharts orders={orders} />
      ) : (
        <DailyCharts orders={orders} selectedMonth={selectedMonth} />
      )}
    </div>
  );
};

export default DashboardCharts;
