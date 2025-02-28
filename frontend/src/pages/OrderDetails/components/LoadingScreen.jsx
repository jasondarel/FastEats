import React from "react";
import Sidebar from "../../../components/Sidebar";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen">
      <Sidebar />
      <div className="flex justify-center items-center w-full">
        <div className="text-xl">Loading order details...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
