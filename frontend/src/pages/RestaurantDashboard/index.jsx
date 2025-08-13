/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useRef } from "react";
import RestaurantHeader from "./components/RestaurantHeader";
import DashboardCharts from "./components/DashboardCharts";
import SellerSummaryCards from "./components/SellerSummaryCards";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import { fetchRestaurantInfo, fetchOrderLists, fetchSellerSummary } from "./services/apiService";
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Star,
  Calendar,
  TrendingUp,
} from "lucide-react";
import io from "socket.io-client";
import { ORDER_URL } from "../../config/api";
import DashboardBanner from "./components/DashboardBanner";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [sellerSummary, setSellerSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("Mar");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(ORDER_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

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

        try {
          const summaryData = await fetchSellerSummary(token);
          setSellerSummary(summaryData?.summary || null);
        } catch (summaryError) {
          console.warn("Could not load seller summary:", summaryError);
        }
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

    return () => {
      socket.off("orderCompleted");
      socket.disconnect();
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
      const successfulStatuses = ["completed"];
      const orderStatus = order.status?.toLowerCase() || "";
      const isSuccessfulOrder = successfulStatuses.includes(orderStatus);

      if (isSuccessfulOrder) {
        successfulOrderCount++;
      }

      if (order.order_type === "CART" && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
          const quantity = item.item_quantity || 0;
          totalOrderQuantity += quantity;

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

  const calculateAdditionalMetrics = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        avgOrderValue: "$0.00",
        topMenuItem: "N/A",
        recentOrders: [],
        ordersByStatus: { preparing: 0, completed: 0, cancelled: 0 },
      };
    }

    const summaryInfo = calculateSummaryInfo();
    const totalRevenue = parseFloat(summaryInfo.totalRevenue.replace("Rp", ""));
    const avgOrderValue =
      summaryInfo.successfulOrderCount > 0
        ? (totalRevenue / summaryInfo.successfulOrderCount).toFixed(2)
        : "0.00";

    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime(); 
    });

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
          <DashboardBanner />

          {/* Main Restaurant Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
            <RestaurantHeader restaurantInfo={restaurantInfo} />

            {/* Seller Summary Section */}
            {sellerSummary && (
              <div className="p-8 bg-gradient-to-b from-white to-purple-50/20 border-b border-purple-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Business Analytics
                  </h2>
                  <p className="text-gray-600">
                    Advanced insights into your customer behavior and performance trends
                  </p>
                </div>
                <SellerSummaryCards summary={sellerSummary} />
              </div>
            )}

           

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