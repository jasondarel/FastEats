// utils/chartDataUtils.js

/**
 * Process orders data for dashboard charts
 * @param {Array} orders - The orders array
 * @param {string} selectedMonth - Selected month for daily view
 * @returns {Object} Processed data for monthly and daily charts
 */
export const processOrdersData = (orders, selectedMonth = "Mar") => {
  if (!orders || orders.length === 0) {
    return { monthlyData: [], dailyData: [] };
  }

  // Initialize data structures for monthly and daily views
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize monthly data map
  let monthlyDataMap = {};
  months.forEach((month) => {
    monthlyDataMap[month] = { orders: 0, revenue: 0 };
  });

  // Initialize daily data map
  let dailyDataMap = {};
  // Get month index from name
  const monthIndex = months.indexOf(selectedMonth);
  // Get days in month (for simplicity, using current year)
  const daysInMonth = new Date(
    new Date().getFullYear(),
    monthIndex + 1,
    0
  ).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    dailyDataMap[i.toString()] = { orders: 0, revenue: 0 };
  }

  // Process each order
  orders.forEach((order) => {
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
  const monthlyData = months.map((month) => ({
    month,
    orders: monthlyDataMap[month].orders,
    revenue: monthlyDataMap[month].revenue,
  }));

  const dailyData = Object.keys(dailyDataMap).map((day) => ({
    day,
    orders: dailyDataMap[day].orders,
    revenue: dailyDataMap[day].revenue,
  }));

  return { monthlyData, dailyData };
};
