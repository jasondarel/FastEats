import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Star,
  Calendar,
} from "lucide-react";

const DashboardBanner = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatJakartaTime = (date) => {
    // Add 7 hours for Jakarta time (UTC+7)
    const jakartaDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    return jakartaDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatJakartaDate = (date) => {
    // Add 7 hours for Jakarta time (UTC+7)
    const jakartaDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    return jakartaDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="z-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-2xl shadow-xl p-8 flex text-white overflow-hidden relative">
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
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatJakartaDate(currentTime)}
            </span>
          </div>
        </div>
      </div>
      <div className="ml-120 mt-10">
        <div className="text-3xl font-bold font-mono tracking-wider transition-all duration-300 ease-in-out">
          {formatJakartaTime(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default DashboardBanner;
