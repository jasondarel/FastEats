import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { processOrdersData } from "../utils/chartDataUtils";

const MonthlyCharts = ({ orders }) => {
  // References for charts
  const monthlyOrdersChartRef = useRef(null);
  const monthlyRevenueChartRef = useRef(null);

  // References for chart instances
  const ordersChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  // Create charts when orders data changes
  useEffect(() => {
    if (
      !monthlyOrdersChartRef.current ||
      !monthlyRevenueChartRef.current ||
      !orders.length
    ) {
      return;
    }

    // Destroy existing charts
    if (ordersChartInstance.current) {
      ordersChartInstance.current.destroy();
      ordersChartInstance.current = null;
    }

    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
      revenueChartInstance.current = null;
    }

    // Process data for charts
    const { monthlyData } = processOrdersData(orders);
    const monthlyLabels = monthlyData.map((item) => item.month);
    const monthlyOrdersData = monthlyData.map((item) => item.orders);
    const monthlyRevenueData = monthlyData.map((item) => item.revenue);

    // Create monthly orders chart
    ordersChartInstance.current = new Chart(monthlyOrdersChartRef.current, {
      type: "bar",
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Orders",
            data: monthlyOrdersData,
            backgroundColor: "#3B82F6",
            borderColor: "#2563EB",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Create monthly revenue chart
    revenueChartInstance.current = new Chart(monthlyRevenueChartRef.current, {
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Revenue",
            data: monthlyRevenueData,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "#10B981",
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (ordersChartInstance.current) {
        ordersChartInstance.current.destroy();
        ordersChartInstance.current = null;
      }

      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
        revenueChartInstance.current = null;
      }
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders Chart */}
      <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Monthly Orders
        </h3>
        <div className="h-64">
          <canvas ref={monthlyOrdersChartRef}></canvas>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Monthly Revenue
        </h3>
        <div className="h-64">
          <canvas ref={monthlyRevenueChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCharts;
