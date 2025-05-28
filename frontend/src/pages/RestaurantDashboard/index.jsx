/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import RestaurantHeader from "./components/RestaurantHeader";
import DashboardCharts from "./components/DashboardCharts";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import { fetchRestaurantInfo, fetchOrderLists } from "./services/apiService";
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Star,
  Calendar,
} from "lucide-react";
import io from "socket.io-client";
import { ORDER_URL } from "../../config/api";

const RestaurantDashboard = () => {
  const socket = io(ORDER_URL);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("Mar");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const restInfo = await fetchRestaurantInfo(token);
        if (!restInfo || !restInfo.restaurant) {
          throw new Error("Failed to load restaurant information");
        }
        setRestaurantName(restInfo.restaurant.restaurant_name);
        setRestaurantImage(restInfo.restaurant.restaurant_image);

        const orderData = await fetchOrderLists(token);
        setOrders(orderData?.orders || []);
      } catch (error) {
        setError(error.message || "Failed to load restaurant information");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    socket.on("orderCompleted", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, ...updatedOrder }
            : order
        )
      );
    });

    // ✅ Optional: Listen to other events like new orders, etc.
    // socket.on("newOrder", (newOrder) => {
    //   setOrders((prevOrders) => [newOrder, ...prevOrders]);
    // });

  
    return () => {
      socket.off("orderCompleted");
    };
  }, [token]);

  const calculateSummaryInfo = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: "Rp0.00",
        successfulOrderCount: 0,
      };
    }

    let totalOrderQuantity = 0;
    let totalRevenue = 0;
    let totalOrderCount = orders.length;
    let successfulOrderCount = 0;

    orders.forEach((order) => {
      // Define what statuses count as "successful" for revenue
      const successfulStatuses = ["completed"];
      const orderStatus = order.status?.toLowerCase() || "";
      const isSuccessfulOrder = successfulStatuses.includes(orderStatus);

      // Count successful orders
      if (isSuccessfulOrder) {
        successfulOrderCount++;
      }

      if (order.order_type === "CART" && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
          const quantity = item.item_quantity || 0;
          totalOrderQuantity += quantity;

          // Only add to revenue if order is successful
          if (isSuccessfulOrder) {
            const menuItem =
              order.menu && Array.isArray(order.menu) && order.menu[index];
            const price = menuItem ? parseFloat(menuItem.menu_price) || 0 : 0;
            totalRevenue += price * quantity;
          }
        });
      } else {
        const quantity = order.item_quantity || 1;
        totalOrderQuantity += quantity;

        if (isSuccessfulOrder) {
          let price = 0;
          if (order.menu) {
            if (Array.isArray(order.menu) && order.menu.length > 0) {
              price = parseFloat(order.menu[0].menu_price) || 0;
            } else if (order.menu.menu_price) {
              price = parseFloat(order.menu.menu_price) || 0;
            }
          }
          totalRevenue += price * quantity;
        }
      }
    });

    return {
      totalItems: totalOrderQuantity,
      totalOrders: totalOrderCount,
      totalRevenue: `Rp${totalRevenue.toFixed(2)}`,
      successfulOrderCount: successfulOrderCount,
    };
  };

  // In your index.jsx file, update the calculateAdditionalMetrics function:

  const calculateAdditionalMetrics = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        avgOrderValue: "$0.00",
        topMenuItem: "N/A",
        recentOrders: [],
        ordersByStatus: { preparing: 0, completed: 0, cancelled: 0 },
      };
    }

    console.log(
      "Order statuses:",
      orders.map((order) => order.status)
    );

    const summaryInfo = calculateSummaryInfo();
    const totalRevenue = parseFloat(summaryInfo.totalRevenue.replace("Rp", ""));
    const avgOrderValue =
      summaryInfo.successfulOrderCount > 0
        ? (totalRevenue / summaryInfo.successfulOrderCount).toFixed(2)
        : "0.00";

    // Sort orders by created_at date in descending order (most recent first)
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    // Take the 5 most recent orders
    const recentOrders = sortedOrders.slice(0, 5);

    const ordersByStatus = orders.reduce(
      (acc, order) => {
        const status = order.status?.toLowerCase() || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { preparing: 0, completed: 0, cancelled: 0 }
    );

    const menuItemCounts = {};
    orders.forEach((order) => {
      if (order.order_type === "CART" && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
          const menuItem =
            order.menu && Array.isArray(order.menu) && order.menu[index];
          if (menuItem && menuItem.menu_name) {
            menuItemCounts[menuItem.menu_name] =
              (menuItemCounts[menuItem.menu_name] || 0) +
              (item.item_quantity || 1);
          }
        });
      } else if (order.menu) {
        let menuName = "";
        if (Array.isArray(order.menu) && order.menu.length > 0) {
          menuName = order.menu[0].menu_name;
        } else if (order.menu.menu_name) {
          menuName = order.menu.menu_name;
        }
        if (menuName) {
          menuItemCounts[menuName] =
            (menuItemCounts[menuName] || 0) + (order.item_quantity || 1);
        }
      }
    });

    const topMenuItem =
      Object.keys(menuItemCounts).length > 0
        ? Object.keys(menuItemCounts).reduce((a, b) =>
            menuItemCounts[a] > menuItemCounts[b] ? a : b
          )
        : "N/A";

    return {
      avgOrderValue: `Rp${avgOrderValue}`,
      topMenuItem,
      recentOrders,
      ordersByStatus,
    };
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "monthly" ? "daily" : "monthly");
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    if (restaurantName) {
      const summaryInfo = { totalOrders: 0, totalRevenue: "Rp0.00" };
      const restaurantInfo = {
        name: restaurantName,
        image: restaurantImage,
        ...summaryInfo,
      };

      return (
        <div className="flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
          <Sidebar />
          <div className="lg:pl-[250px] xl:pl-[250px] flex-1 p-6">
            <div className="max-w-6xl mx-auto md:mt-10 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
                <RestaurantHeader restaurantInfo={restaurantInfo} />
                <DashboardCharts
                  orders={[]}
                  viewMode={viewMode}
                  selectedMonth={selectedMonth}
                  toggleViewMode={toggleViewMode}
                  handleMonthChange={handleMonthChange}
                />
                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <p className="text-amber-700 text-sm font-medium">
                      Note: Order data couldn&apos;t be loaded. Showing empty
                      charts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600">Error</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summaryInfo = calculateSummaryInfo();
  const additionalMetrics = calculateAdditionalMetrics();
  const restaurantInfo = {
    name: restaurantName,
    image: restaurantImage,
    ...summaryInfo,
  };

  return (
    <div className="flex bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
      <Sidebar />
      <div className="mx-12 lg:pl-[250px] xl:pl-[250px] flex-1 p-6">
        <div className=" max-w-7xl mx-auto md:mt-10 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-2xl shadow-xl p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back!</h1>
                  <p className="text-white/90">
                    Here's your restaurant performance overview
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Today: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Restaurant Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
            <RestaurantHeader restaurantInfo={restaurantInfo} />

            {/* Enhanced Metrics Grid */}
            <div className="p-8 bg-gradient-to-b from-white to-amber-50/30">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Quick Stats
                </h2>
                <p className="text-gray-600">
                  Real-time insights into your restaurant performance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">
                        Avg Order Value
                      </p>
                      <p className="text-3xl font-bold text-green-800">
                        {additionalMetrics.avgOrderValue}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Per completed order
                      </p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-full">
                      <DollarSign className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 mb-1">
                        Top Menu Item
                      </p>
                      <p className="text-lg font-bold text-orange-800 truncate">
                        {additionalMetrics.topMenuItem}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Most popular dish
                      </p>
                    </div>
                    <div className="bg-orange-100 p-4 rounded-full">
                      <Star className="w-7 h-7 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 mb-1">
                        Preparing Orders
                      </p>
                      <p className="text-3xl font-bold text-yellow-800">
                        {additionalMetrics.ordersByStatus.preparing}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Currently in kitchen
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-full">
                      <Clock className="w-7 h-7 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">
                        Completed Orders
                      </p>
                      <p className="text-3xl font-bold text-blue-800">
                        {additionalMetrics.ordersByStatus.completed}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Successfully delivered
                      </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-full">
                      <CheckCircle className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              {orders.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Recent Activity
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">
                        Live updates
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {additionalMetrics.recentOrders
                      .slice(0, 3)
                      .map((order, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              Order #{order.order_id || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              • Status: {order.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.status?.toLowerCase() === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status?.toLowerCase() === "preparing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Charts Section */}
            <DashboardCharts
              orders={orders}
              viewMode={viewMode}
              selectedMonth={selectedMonth}
              toggleViewMode={toggleViewMode}
              handleMonthChange={handleMonthChange}
            />
          </div>

          <div className="text-center py-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-gray-600 text-sm">
                Dashboard last updated: {new Date().toLocaleString()}
              </p>
              <div className="flex justify-center space-x-4 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
