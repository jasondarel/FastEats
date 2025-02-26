import React, { useState, useEffect, useRef } from "react";
import { FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import Chart from 'chart.js/auto';

const RestaurantDashboard = () => {
  // References for charts
  const monthlyOrdersChartRef = useRef(null);
  const monthlyRevenueChartRef = useRef(null);
  const dailyOrdersChartRef = useRef(null);
  const dailyRevenueChartRef = useRef(null);
  
  // Chart instances
  const [monthlyOrdersChart, setMonthlyOrdersChart] = useState(null);
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState(null);
  const [dailyOrdersChart, setDailyOrdersChart] = useState(null);
  const [dailyRevenueChart, setDailyRevenueChart] = useState(null);

  // Sample data - in a real app, this would come from props or an API
  const restaurantInfo = {
    name: "Jensen huang",
    image: "/jensen.png",
    totalOrders: 1248,
    totalRevenue: "$45,890",
  };

  // Monthly data
  const monthlyData = [
    { month: "Jan", orders: 92, revenue: 3200 },
    { month: "Feb", orders: 87, revenue: 3100 },
    { month: "Mar", orders: 95, revenue: 3500 },
    { month: "Apr", orders: 110, revenue: 4200 },
    { month: "May", orders: 120, revenue: 4500 },
    { month: "Jun", orders: 135, revenue: 5100 },
    { month: "Jul", orders: 150, revenue: 5800 },
    { month: "Aug", orders: 142, revenue: 5300 },
    { month: "Sep", orders: 125, revenue: 4800 },
    { month: "Oct", orders: 110, revenue: 4100 },
    { month: "Nov", orders: 95, revenue: 3290 },
    { month: "Dec", orders: 87, revenue: 3000 },
  ];

  // Daily data for the current month (sample data)
  const dailyData = [
    { day: "1", revenue: 165, orders: 5 },
    { day: "2", revenue: 190, orders: 6 },
    { day: "3", revenue: 210, orders: 7 },
    { day: "4", revenue: 188, orders: 6 },
    { day: "5", revenue: 240, orders: 8 },
    { day: "6", revenue: 252, orders: 8 },
    { day: "7", revenue: 265, orders: 9 },
    { day: "8", revenue: 230, orders: 7 },
    { day: "9", revenue: 245, orders: 8 },
    { day: "10", revenue: 260, orders: 9 },
    { day: "11", revenue: 275, orders: 9 },
    { day: "12", revenue: 220, orders: 7 },
    { day: "13", revenue: 235, orders: 8 },
    { day: "14", revenue: 267, orders: 9 },
    { day: "15", revenue: 290, orders: 10 },
    { day: "16", revenue: 310, orders: 11 },
    { day: "17", revenue: 285, orders: 10 },
    { day: "18", revenue: 270, orders: 9 },
    { day: "19", revenue: 295, orders: 10 },
    { day: "20", revenue: 320, orders: 11 },
    { day: "21", revenue: 305, orders: 10 },
    { day: "22", revenue: 315, orders: 11 },
    { day: "23", revenue: 330, orders: 12 },
    { day: "24", revenue: 300, orders: 10 },
    { day: "25", revenue: 290, orders: 10 },
    { day: "26", revenue: 280, orders: 9 },
    { day: "27", revenue: 310, orders: 11 },
    { day: "28", revenue: 325, orders: 11 },
    { day: "29", revenue: 340, orders: 12 },
    { day: "30", revenue: 355, orders: 12 },
  ];

  // View mode state (monthly/daily)
  const [viewMode, setViewMode] = useState("monthly");
  
  // Month selection for daily view
  const [selectedMonth, setSelectedMonth] = useState("February");

  // Destroy all chart instances
  const destroyCharts = () => {
    if (monthlyOrdersChart) {
      monthlyOrdersChart.destroy();
      setMonthlyOrdersChart(null);
    }
    if (monthlyRevenueChart) {
      monthlyRevenueChart.destroy();
      setMonthlyRevenueChart(null);
    }
    if (dailyOrdersChart) {
      dailyOrdersChart.destroy();
      setDailyOrdersChart(null);
    }
    if (dailyRevenueChart) {
      dailyRevenueChart.destroy();
      setDailyRevenueChart(null);
    }
  };

  // Create monthly charts
  const createMonthlyCharts = () => {
    if (monthlyOrdersChartRef.current && monthlyRevenueChartRef.current) {
      const monthlyLabels = monthlyData.map(item => item.month);
      const monthlyOrdersData = monthlyData.map(item => item.orders);
      const monthlyRevenueData = monthlyData.map(item => item.revenue);

      // Create monthly orders chart
      const ordersChart = new Chart(monthlyOrdersChartRef.current, {
        type: 'bar',
        data: {
          labels: monthlyLabels,
          datasets: [{
            label: 'Orders',
            data: monthlyOrdersData,
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      setMonthlyOrdersChart(ordersChart);

      // Create monthly revenue chart
      const revenueChart = new Chart(monthlyRevenueChartRef.current, {
        type: 'line',
        data: {
          labels: monthlyLabels,
          datasets: [{
            label: 'Revenue',
            data: monthlyRevenueData,
            backgroundColor: 'rgba(16, 185, 129, 0.2)', 
            borderColor: '#10B981',
            borderWidth: 2,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      setMonthlyRevenueChart(revenueChart);
    }
  };

  // Create daily charts
  const createDailyCharts = () => {
    if (dailyOrdersChartRef.current && dailyRevenueChartRef.current) {
      const dailyLabels = dailyData.map(item => item.day);
      const dailyOrdersData = dailyData.map(item => item.orders);
      const dailyRevenueData = dailyData.map(item => item.revenue);

      // Create daily orders chart
      const ordersChart = new Chart(dailyOrdersChartRef.current, {
        type: 'bar',
        data: {
          labels: dailyLabels,
          datasets: [{
            label: 'Orders',
            data: dailyOrdersData,
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      setDailyOrdersChart(ordersChart);

      // Create daily revenue chart
      const revenueChart = new Chart(dailyRevenueChartRef.current, {
        type: 'line',
        data: {
          labels: dailyLabels,
          datasets: [{
            label: 'Revenue',
            data: dailyRevenueData,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10B981',
            borderWidth: 2,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      setDailyRevenueChart(revenueChart);
    }
  };

  // Initialize charts based on view mode
  const initializeCharts = () => {
    if (viewMode === "monthly") {
      createMonthlyCharts();
    } else {
      createDailyCharts();
    }
  };

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      destroyCharts();
    };
  }, []);

  // Effect for viewMode changes
  useEffect(() => {
    // Always destroy charts before creating new ones
    destroyCharts();
    
    // Use a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeCharts();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [viewMode]);

  // Export handlers
  const handleExportToPDF = () => {
    // In a real application, you would implement PDF generation logic
    console.log("Exporting to PDF...");
    alert("Exporting dashboard data to PDF");
  };

  const handleExportToExcel = () => {
    // In a real application, you would implement Excel export logic
    console.log("Exporting to Excel...");
    alert("Exporting dashboard data to Excel");
  };

  // Toggle view between monthly and daily
  const toggleViewMode = () => {
    setViewMode(viewMode === "monthly" ? "daily" : "monthly");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto md:mt-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header with restaurant info */}
          <div className="flex flex-col md:flex-row p-6 border-b">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <img
                src={restaurantInfo.image}
                alt={restaurantInfo.name}
                className="rounded-lg shadow-md w-full h-64 object-cover"
              />
            </div>
            <div className="md:w-2/3 md:pl-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {restaurantInfo.name}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-500 font-medium">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {restaurantInfo.totalOrders}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-500 font-medium">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {restaurantInfo.totalRevenue}
                  </p>
                </div>
              </div>
              
              {/* Export Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleExportToPDF}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <FileText className="mr-2" size={18} />
                  Export to PDF
                </button>
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2" size={18} />
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Charts section */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Performance Overview
              </h2>
              
              {/* Toggle view button */}
              <div className="flex items-center">
                <button
                  onClick={toggleViewMode}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  {viewMode === "monthly" ? "Switch to Daily View" : "Switch to Monthly View"}
                </button>
                
                {/* Month selector - only visible in daily view */}
                {viewMode === "daily" && (
                  <div className="relative ml-4">
                    <div className="flex items-center border rounded-md px-3 py-2 bg-white cursor-pointer">
                      <span>{selectedMonth}</span>
                      <ChevronDown size={16} className="ml-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly View */}
            {viewMode === "monthly" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Monthly Orders
                  </h3>
                  <div className="h-64">
                    <canvas ref={monthlyOrdersChartRef}></canvas>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Monthly Revenue
                  </h3>
                  <div className="h-64">
                    <canvas ref={monthlyRevenueChartRef}></canvas>
                  </div>
                </div>
              </div>
            )}

            {/* Daily View */}
            {viewMode === "daily" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Orders Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Daily Orders - {selectedMonth}
                  </h3>
                  <div className="h-64">
                    <canvas ref={dailyOrdersChartRef}></canvas>
                  </div>
                </div>

                {/* Daily Revenue Chart */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Daily Revenue - {selectedMonth}
                  </h3>
                  <div className="h-64">
                    <canvas ref={dailyRevenueChartRef}></canvas>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;