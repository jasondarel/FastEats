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

  // Calculate summary information
  const calculateSummaryInfo = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return { totalOrders: 0, totalRevenue: "$0.00" };
    }

    let totalOrderQuantity = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (order.order_type === "CART" && Array.isArray(order.items)) {
        // Process cart orders - multiple items
        order.items.forEach((item, index) => {
          const quantity = item.item_quantity || 0;
          totalOrderQuantity += quantity;
          
          // Get corresponding menu item price
          const menuItem = order.menu && Array.isArray(order.menu) && order.menu[index];
          const price = menuItem ? parseFloat(menuItem.menu_price) || 0 : 0;
          totalRevenue += price * quantity;
        });
      } else {
        // Process single item orders
        const quantity = order.item_quantity || 1;
        totalOrderQuantity += quantity;
        
        // Get menu price (menu could be an array with one item or a direct reference)
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

  if (error) {
    // Even if there's an error with order data, if we have restaurant info,
    // we'll show the dashboard with empty charts
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
            <div className="max-w-6xl mx-auto md:mt-10">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                {/* Restaurant Header Component */}
                <RestaurantHeader restaurantInfo={restaurantInfo} />

                {/* Charts Component */}
                <DashboardCharts
                  orders={[]}
                  viewMode={viewMode}
                  selectedMonth={selectedMonth}
                  toggleViewMode={toggleViewMode}
                  handleMonthChange={handleMonthChange}
                />
                
                {/* Error notification */}
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                  <p className="text-amber-600 text-sm">
                    Note: Order data couldn&apos;t be loaded. Showing empty charts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // If we don't even have restaurant info, show the error page
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
  const restaurantInfo = {
    name: restaurantName,
    image: restaurantImage,
    ...summaryInfo,
  };

  return (
    <div className="flex bg-amber-50 min-h-screen">
      <Sidebar />
      <div className="lg:pl-[250px] xl:pl-[250px] flex-1 p-6">
        <div className="max-w-6xl mx-auto md:mt-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Restaurant Header Component */}
            <RestaurantHeader restaurantInfo={restaurantInfo} />

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
    </div>
  );
};

export default RestaurantDashboard;