import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { processOrdersData } from "../utils/chartDataUtils";

const DailyCharts = ({ orders, selectedMonth }) => {
  // References for charts
  const dailyOrdersChartRef = useRef(null);
  const dailyRevenueChartRef = useRef(null);

  // References for chart instances
  const ordersChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  // Create charts when orders data or selected month changes
  useEffect(() => {
    if (
      !dailyOrdersChartRef.current ||
      !dailyRevenueChartRef.current ||
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
    const { dailyData } = processOrdersData(orders, selectedMonth);
    const dailyLabels = dailyData.map((item) => item.day);
    const dailyOrdersData = dailyData.map((item) => item.orders);
    const dailyRevenueData = dailyData.map((item) => item.revenue);

    // Create daily orders chart
    ordersChartInstance.current = new Chart(dailyOrdersChartRef.current, {
      type: "bar",
      data: {
        labels: dailyLabels,
        datasets: [
          {
            label: "Orders",
            data: dailyOrdersData,
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

    // Create daily revenue chart
    revenueChartInstance.current = new Chart(dailyRevenueChartRef.current, {
      type: "line",
      data: {
        labels: dailyLabels,
        datasets: [
          {
            label: "Revenue",
            data: dailyRevenueData,
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
  }, [orders, selectedMonth]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Orders Chart */}
      <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Daily Orders - {selectedMonth}
        </h3>
        <div className="h-64">
          <canvas ref={dailyOrdersChartRef}></canvas>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Daily Revenue - {selectedMonth}
        </h3>
        <div className="h-64">
          <canvas ref={dailyRevenueChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default DailyCharts;
