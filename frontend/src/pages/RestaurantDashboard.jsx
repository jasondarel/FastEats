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

  // State for orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);

  // Sample restaurant info - update with real data in production
  const restaurantInfo = {
    name: restaurantName,
    image: restaurantImage,
    totalOrders: 0,
    totalRevenue: "$0",
  };

  // View mode state (monthly/daily)
  const [viewMode, setViewMode] = useState("monthly");
  
  // Month selection for daily view
  const [selectedMonth, setSelectedMonth] = useState("March");

  const fetchOrderLists = async() => {
    try {
      const response = await fetch(
        "http://localhost:5000/order/orders-by-restaurant",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setOrders(data.orders);
    } catch(err) {
      console.error("Error fetching orders:", err);
    }
  }

  const fetchRestaurantInfo = async() => {
    try {
      const response = await fetch("http://localhost:5000/restaurant/restaurant", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json();
      setRestaurantName(data.restaurant.restaurant_name);
      setRestaurantImage(data.restaurant.restaurant_image);
    } catch(err) {
      console.error("Error fetching restaurant info:", err);
    }
  }

  // Fetch data - simulated with the provided JSON
  useEffect(() => {
    fetchRestaurantInfo();
    fetchOrderLists();
    // In a real app, this would be an API call
    const fetchData = () => {
      try {
        const responseData = {
          "success": true,
          "orders": [
            {
              "order_id": 63,
              "user_id": 51,
              "menu_id": 2,
              "restaurant_id": 3,
              "item_quantity": 1,
              "status": "Preparing",
              "created_at": "2025-03-02T19:17:18.250Z",
              "updated_at": "2025-03-02T19:17:18.250Z",
              "menu": {
                "menu_id": 2,
                "menu_name": "Kopi Gula Aren",
                "menu_description": null,
                "menu_image": "1740967311253-picture-1578886068.jpg",
                "restaurant_id": 3,
                "menu_category": "Drink",
                "is_available": true,
                "menu_price": "20000.00",
                "created_at": "2025-03-02T19:01:51.364Z",
                "updated_at": "2025-03-02T19:01:51.364Z"
              },
              "user": {
                "id": 51,
                "name": "AndreanDjabbar",
                "email": "andreanjabar19@gmail.com",
                "role": "user",
                "profile_photo": null,
                "address": null,
                "phone_number": null
              }
            }
          ]
        };
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process orders data for dashboard
  const processOrdersData = () => {
    if (orders.length === 0) return { monthlyData: [], dailyData: [] };

    // Initialize data structures for monthly and daily views
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyDataMap = {};
    months.forEach(month => {
      monthlyDataMap[month] = { orders: 0, revenue: 0 };
    });

    // Initialize days for current month (using selectedMonth)
    let dailyDataMap = {};
    // Get month index from name
    const monthIndex = months.indexOf(selectedMonth);
    // Get days in month (for simplicity, using current year)
    const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      dailyDataMap[i.toString()] = { orders: 0, revenue: 0 };
    }

    // Process each order
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthName = months[orderDate.getMonth()];
      const day = orderDate.getDate().toString();
      const price = parseFloat(order.menu.menu_price) * order.item_quantity;

      // Update monthly data
      if (monthlyDataMap[monthName]) {
        monthlyDataMap[monthName].orders += order.item_quantity;
        monthlyDataMap[monthName].revenue += price;
      }

      // Update daily data if order is in selected month
      if (orderDate.getMonth() === monthIndex && dailyDataMap[day]) {
        dailyDataMap[day].orders += order.item_quantity;
        dailyDataMap[day].revenue += price;
      }
    });

    // Convert maps to arrays for chart.js
    const monthlyData = months.map(month => ({
      month,
      orders: monthlyDataMap[month].orders,
      revenue: monthlyDataMap[month].revenue
    }));

    const dailyData = Object.keys(dailyDataMap).map(day => ({
      day,
      orders: dailyDataMap[day].orders,
      revenue: dailyDataMap[day].revenue
    }));

    return { monthlyData, dailyData };
  };

  // Calculate restaurant summary info
  const calculateSummaryInfo = () => {
    if (orders.length === 0) return { totalOrders: 0, totalRevenue: "$0" };

    let totalOrderQuantity = 0;
    let totalRevenue = 0;

    orders.forEach(order => {
      totalOrderQuantity += order.item_quantity;
      totalRevenue += parseFloat(order.menu.menu_price) * order.item_quantity;
    });

    return {
      totalOrders: totalOrderQuantity,
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
    };
  };

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
      const { monthlyData } = processOrdersData();
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
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
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
      const { dailyData } = processOrdersData();
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
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
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
    if (loading) return;
    
    // Always destroy charts before creating new ones
    destroyCharts();
    
    // Use a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeCharts();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [viewMode, loading, orders, selectedMonth]);

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

  // Handle month selection change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Get summary information
  const summaryInfo = calculateSummaryInfo();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard data...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto md:mt-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row p-6 border-b">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <img
                src={`http://localhost:5000/restaurant/uploads/restaurant/${restaurantInfo.image}`}
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
                    {summaryInfo.totalOrders}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-500 font-medium">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {summaryInfo.totalRevenue}
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
                
                {viewMode === "daily" && (
                  <div className="relative ml-4">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="border rounded-md px-3 py-2 bg-white cursor-pointer"
                    >
                      <option value="Jan">January</option>
                      <option value="Feb">February</option>
                      <option value="Mar">March</option>
                      <option value="Apr">April</option>
                      <option value="May">May</option>
                      <option value="Jun">June</option>
                      <option value="Jul">July</option>
                      <option value="Aug">August</option>
                      <option value="Sep">September</option>
                      <option value="Oct">October</option>
                      <option value="Nov">November</option>
                      <option value="Dec">December</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

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