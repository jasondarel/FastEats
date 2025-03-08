import React, { useState, useEffect } from "react";
import RestaurantHeader from "./components/RestaurantHeader";
import DashboardCharts from "./components/DashboardCharts";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import { fetchRestaurantInfo, fetchOrderLists } from "./services/apiService";

const RestaurantDashboard = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("Mar");

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const restInfo = await fetchRestaurantInfo(token);
        console.log(restInfo);
        setRestaurantName(restInfo.restaurant.restaurant_name);
        setRestaurantImage(restInfo.restaurant.restaurant_image);

        const orderData = await fetchOrderLists(token);
        setOrders(orderData.orders);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  // Calculate summary information
  const calculateSummaryInfo = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return { totalOrders: 0, totalRevenue: "$0" };
    }

    let totalOrderQuantity = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      totalOrderQuantity += order.item_quantity;
      totalRevenue += parseFloat(order.menu.menu_price) * order.item_quantity;
    });

    return {
      totalOrders: totalOrderQuantity,
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
    };
  };

  // Toggle view between monthly and daily
  const toggleViewMode = () => {
    setViewMode(viewMode === "monthly" ? "daily" : "monthly");
  };

  // Handle month selection change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  if (loading) {
    return <LoadingState />;
  }

  const summaryInfo = calculateSummaryInfo();
  const restaurantInfo = {
    name: restaurantName,
    image: restaurantImage,
    ...summaryInfo,
  };

  return (
    <div className="bg-amber-50 min-h-screen p-6">
      <Sidebar />
      <div className="max-w-6xl mx-auto md:mt-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Restaurant Header Component */}
          <RestaurantHeader 
          restaurantInfo={restaurantInfo}/>

          {/* Charts Component */}
          <DashboardCharts
            orders={orders}
            viewMode={viewMode}
            selectedMonth={selectedMonth}
            toggleViewMode={toggleViewMode}
            handleMonthChange={handleMonthChange}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
