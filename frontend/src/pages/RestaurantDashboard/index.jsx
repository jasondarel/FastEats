import { useState, useEffect } from "react";
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
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch restaurant info
        const restInfo = await fetchRestaurantInfo(token);
        if (!restInfo || !restInfo.restaurant) {
          throw new Error("Failed to load restaurant information");
        }
        setRestaurantName(restInfo.restaurant.restaurant_name);
        setRestaurantImage(restInfo.restaurant.restaurant_image);

        // Fetch orders
        const orderData = await fetchOrderLists(token);
        console.log("Fetching orders with token:", token);

        // Debug the API response
        console.log("=== ORDER DATA DEBUG ===");
        console.log("Full API response:", orderData);
        console.log("Orders array:", orderData?.orders);
        console.log("Orders count:", orderData?.orders?.length);
        // If orders exist, set them. Otherwise, use empty array
        setOrders(orderData?.orders || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(error.message || "Failed to load restaurant information");
        // Continue with empty orders array
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const calculateSummaryInfo = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return { totalOrders: 0, totalRevenue: "$0.00", successfulOrderCount: 0 };
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
      totalRevenue: `${totalRevenue.toFixed(2)}`,
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

    console.log(
      "Order statuses:",
      orders.map((order) => order.status)
    );

    const summaryInfo = calculateSummaryInfo();
    const totalRevenue = parseFloat(summaryInfo.totalRevenue.replace("$", ""));
    const avgOrderValue =
      summaryInfo.successfulOrderCount > 0
        ? (totalRevenue / summaryInfo.successfulOrderCount).toFixed(2)
        : "0.00";

    const recentOrders = orders.slice(-5).reverse();

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
      avgOrderValue: `$${avgOrderValue}`,
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
      const summaryInfo = { totalOrders: 0, totalRevenue: "$0.00" };
      const restaurantInfo = {
        name: restaurantName,
        image: restaurantImage,
        ...summaryInfo,
      };

      return (
        <div className="flex bg-amber-50 min-h-screen">
          <Sidebar />
          <div className="lg:pl-[250px] xl:pl-[250px] flex-1 p-6">
            <div className="max-w-6xl mx-auto md:mt-10 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <RestaurantHeader restaurantInfo={restaurantInfo} />
                <DashboardCharts
                  orders={[]}
                  viewMode={viewMode}
                  selectedMonth={selectedMonth}
                  toggleViewMode={toggleViewMode}
                  handleMonthChange={handleMonthChange}
                />
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                  <p className="text-amber-600 text-sm">
                    Note: Order data couldn&apos;t be loaded. Showing empty
                    charts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex bg-amber-50 min-h-screen justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
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
    <div className="flex bg-amber-50 min-h-screen">
      <Sidebar />
      <div className="lg:pl-[250px] xl:pl-[250px] flex-1 p-6">
        <div className="max-w-6xl mx-auto md:mt-10 space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <RestaurantHeader restaurantInfo={restaurantInfo} />
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {additionalMetrics.avgOrderValue}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Top Menu Item
                      </p>
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {additionalMetrics.topMenuItem}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Preparing Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {additionalMetrics.ordersByStatus.preparing}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {additionalMetrics.ordersByStatus.completed}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default RestaurantDashboard;
