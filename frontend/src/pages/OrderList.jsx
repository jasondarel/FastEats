import React from "react";
import Sidebar from "../components/Sidebar";
import { ChevronRightIcon } from "lucide-react";

const OrderList = () => {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8">
        <div className="w-full max-w-6xl sticky top-0 py-4 z-5 bg-white">
          <h2 className="text-4xl font-extrabold text-center text-yellow-600">
            Order List
          </h2>
          <hr className="border-t-2 border-gray-400 w-full max-w-6xl mt-4" />
        </div>

        {/* Order cards container - with padding to create space from sidebar */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:flex-wrap lg:justify-between">
          {/* Order card */}
          {[1, 2, 3, 4, 5, 6].map((order, index) => (
            <div
              key={index}
              className="flex-col border border-slate-300 shadow-xl rounded-xl px-3 py-2 cursor-pointer mb-4 lg:w-[48%]"
            >
              <div className="flex justify-between gap-8 lg:gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500">
                    Jensen Huang
                  </h2>
                  <p className="text-slate-700">(sep ,12:29)</p>
                </div>
                <div className="flex font-semibold text-slate-700">
                  3 menu <ChevronRightIcon className="pt-0.5" />
                </div>
              </div>
              <hr className="mt-5"></hr>
              <div className="flex justify-between text-slate-800">
                <p className="py-3 text-2xl font-bold">Total Price </p>
                <p className="py-3 text-2xl font-bold">Rp 99999</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
