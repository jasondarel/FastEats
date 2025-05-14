import React from "react";
import Sidebar from "../../../components/Sidebar";

const YellowBackgroundLayout = ({ children }) => {
  return (
    <div
      className="flex w-screen min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/orders.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Sidebar />
      <main className="md:ml-20 flex-1 flex justify-center items-center p-5">
        {children}
      </main>
    </div>
  );
};

export default YellowBackgroundLayout;
