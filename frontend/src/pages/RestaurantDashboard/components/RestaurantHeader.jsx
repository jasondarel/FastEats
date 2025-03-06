import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

const RestaurantHeader = ({ restaurantInfo }) => {
  // Export handlers
  const handleExportToPDF = () => {
    console.log("Exporting to PDF...");
    alert("Exporting dashboard data to PDF");
  };

  const handleExportToExcel = () => {
    console.log("Exporting to Excel...");
    alert("Exporting dashboard data to Excel");
  };

  return (
    <div className="flex flex-col md:flex-row p-6 border-b border-amber-200">
      <div className="md:w-1/3 mb-4 md:mb-0">
        <img
          src={`http://localhost:5000/restaurant/uploads/restaurant/${restaurantInfo.image}`}
          alt={restaurantInfo.name}
          className="rounded-lg shadow-md w-full h-64 object-cover"
        />
      </div>
      <div className="md:w-2/3 md:pl-8 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          {restaurantInfo.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-amber-800">
              {restaurantInfo.totalOrders}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-amber-800">
              {restaurantInfo.totalRevenue}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleExportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <FileText className="mr-2" size={18} />
            Export to PDF
          </button>
          <button
            onClick={handleExportToExcel}
            className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="mr-2" size={18} />
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
