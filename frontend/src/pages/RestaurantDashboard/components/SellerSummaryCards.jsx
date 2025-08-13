/* eslint-disable react/prop-types */
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ShoppingBag,
  Star,
  Trophy,
  Calendar,
} from "lucide-react";

const SellerSummaryCards = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatHour = (hour) => {
    const hourNum = parseInt(hour);
    if (hourNum === 0) return "12:00 AM";
    if (hourNum < 12) return `${hourNum}:00 AM`;
    if (hourNum === 12) return "12:00 PM";
    return `${hourNum - 12}:00 PM`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Top Customer */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-700 mb-1">
              Top Customer
            </p>
            <p className="text-lg font-bold text-purple-800 mb-1 truncate">
              {summary.highestFrequentlyOrderUser?.name || "N/A"}
            </p>
            <p className="text-xs text-purple-600">
              {summary.highestFrequentlyOrderUserTotalOrders || 0} orders
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full ml-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        {summary.highestFrequentlyOrderUser?.email && (
          <p className="text-xs text-purple-500 mt-2 truncate">
            {summary.highestFrequentlyOrderUser.email}
          </p>
        )}
      </div>

      {/* Most Popular Menu */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-lg p-6 border border-rose-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-700 mb-1">
              Popular Menu
            </p>
            <p className="text-lg font-bold text-rose-800 mb-1 truncate">
              {summary.highestFrequentlyOrderMenuName || "N/A"}
            </p>
            <p className="text-xs text-rose-600">
              {summary.highestFrequentlyOrderMenuCategory || "Category"}
            </p>
          </div>
          <div className="bg-rose-100 p-3 rounded-full ml-2">
            <Trophy className="w-6 h-6 text-rose-600" />
          </div>
        </div>
        <p className="text-xs text-rose-500 mt-2">
          {summary.highestOrderQuantity || 0} orders
        </p>
      </div>

      {/* Peak Hour */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg p-6 border border-cyan-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700 mb-1">
              Peak Hour
            </p>
            <p className="text-2xl font-bold text-cyan-800">
              {formatHour(summary.mostPopularOrderHour || 0)}
            </p>
            <p className="text-xs text-cyan-600 mt-1">
              {summary.totalMostPopularOrderHour || 0} orders
            </p>
          </div>
          <div className="bg-cyan-100 p-4 rounded-full">
            <Clock className="w-7 h-7 text-cyan-600" />
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700 mb-1">
              Daily Average
            </p>
            <p className="text-2xl font-bold text-emerald-800">
              {parseFloat(summary.averageOrdersPerDay || 0).toFixed(1)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              orders per day
            </p>
          </div>
          <div className="bg-emerald-100 p-4 rounded-full">
            <Calendar className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Average Revenue */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 mb-1">
              Avg Revenue
            </p>
            <p className="text-lg font-bold text-amber-800 mb-1">
              {formatCurrency(summary.averageObtainRevenue)}
            </p>
            <p className="text-xs text-amber-600">
              average per period
            </p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full ml-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Highest Revenue */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-green-700 mb-1">
              Peak Revenue
            </p>
            <p className="text-lg font-bold text-green-800 mb-1">
              {formatCurrency(summary.highestObtainRevenue)}
            </p>
            <p className="text-xs text-green-600">
              highest single period
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full ml-2">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSummaryCards;