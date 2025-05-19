/* eslint-disable react/prop-types */
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
  // Validate inputs to prevent runtime errors
  const validOrders = Array.isArray(orders) ? orders : [];
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-amber-900 mb-3 md:mb-0">
          Performance Overview
          {validOrders.length === 0 && (
            <span className="ml-2 text-sm font-normal text-amber-600">(No order data available)</span>
          )}
        </h2>
        
        {/* View Selector Component */}
        <ViewSelector
          viewMode={viewMode}
          selectedMonth={selectedMonth}
          toggleViewMode={toggleViewMode}
          handleMonthChange={handleMonthChange}
        />
      </div>
      
      <div className="mt-4">
        {viewMode === "monthly" ? (
          <MonthlyCharts orders={validOrders} />
        ) : (
          <DailyCharts orders={validOrders} selectedMonth={selectedMonth} />
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;