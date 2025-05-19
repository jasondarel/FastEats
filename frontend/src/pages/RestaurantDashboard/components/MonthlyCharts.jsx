import { useMemo } from "react";
/* eslint-disable react/prop-types */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MonthlyCharts = ({ orders }) => {
  // Process orders data to create monthly statistics
  const monthlyData = useMemo(() => {
    // Initialize data structure for all months
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const initialData = months.map(month => ({
      name: month,
      orders: 0,
      revenue: 0
    }));
    
    // If there are no orders, return the empty data structure
    if (!Array.isArray(orders) || orders.length === 0) {
      return initialData;
    }
    
    // Calculate order counts and revenue by month
    orders.forEach(order => {
      // Extract month from order date
      const orderDate = new Date(order.created_at);
      const monthIndex = orderDate.getMonth();
      const monthName = months[monthIndex];
      
      // Find the corresponding month in our data array
      const monthData = initialData.find(item => item.name === monthName);
      if (!monthData) return;
      
      // Process orders based on type
      if (order.order_type === "CART" && Array.isArray(order.items)) {
        // Handle cart orders with multiple items
        order.items.forEach((item, index) => {
          const quantity = item.item_quantity || 0;
          monthData.orders += quantity;
          
          // Calculate revenue from menu prices
          const menuItem = order.menu && Array.isArray(order.menu) && order.menu[index];
          const price = menuItem ? parseFloat(menuItem.menu_price) || 0 : 0;
          monthData.revenue += price * quantity;
        });
      } else {
        // Handle single item orders
        const quantity = order.item_quantity || 1;
        monthData.orders += quantity;
        
        // Calculate revenue
        let price = 0;
        if (order.menu) {
          if (Array.isArray(order.menu) && order.menu.length > 0) {
            price = parseFloat(order.menu[0].menu_price) || 0;
          } else if (order.menu.menu_price) {
            price = parseFloat(order.menu.menu_price) || 0;
          }
        }
        monthData.revenue += price * quantity;
      }
    });
    
    // Format revenue as currency and round to 2 decimal places
    initialData.forEach(item => {
      item.revenue = parseFloat(item.revenue.toFixed(2));
    });
    
    return initialData;
  }, [orders]);
  
  // Custom tooltip to display order count and revenue
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-amber-800">{payload[0].payload.name}</p>
          <p className="text-sm">
            <span className="font-medium text-blue-600">Orders:</span> {payload[0].value}
          </p>
          <p className="text-sm">
            <span className="font-medium text-green-600">Revenue:</span> ${payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="orders" 
                name="Orders" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                yAxisId="right" 
                dataKey="revenue" 
                name="Revenue ($)" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCharts;