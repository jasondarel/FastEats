import React from "react";
import Sidebar from "../components/Sidebar";
import image from "../assets/orderHistory-dummy.jpg";

const OrderHistory = () => {
  return (
    <div className="flex p-4">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center">
        <h2 className="m-5 text-4xl font-extrabold text-center">
          Order History
        </h2>
        <hr className="border-t-2 border-gray-400 w-full max-w-lg my-4" />
        <div className="px-3 py-4 rounded-md w-full max-w-lg inset-shadow-sm inset-shadow-slate-200 shadow-sm shadow-slate-300 ">
          <div className="flex justify-between max-h-screen gap-x-60">
            <div className="flex">
              <div className="flex items-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold leading-3 text-sm">Order</h4>
                <text className="text-sm text-slate-700">13 Nov 2025</text>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-green-300 px-1 py-0.5 rounded-md text-green-800 font-semibold">
               Completed
              </div>
            </div>
          </div>
          <hr className="my-3 border-gray-300" />
          <div className="flex">
            <img
              src={image}
              alt="product"
              className="w-20 h-20 object-contain"
            />
            <div className="pt-3 pl-3 w-full">
              <h2 className="font-bold truncate w-80 overflow-hidden text-ellipsis whitespace-nowrap text-lg">
                Minuman Yang Sangat Mantap banget
              </h2>
              <p className="text-slate-600">1 Item</p>
            </div>
          </div>
          <div className="flex justify-between max-h-screen gap-x-60">
            <div className="flex flex-col">
              <h2 className="text-sm">Total Order</h2>
              <p className="font-bold">$ 89.99</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-green-700 px-3 py-0.5 rounded-md text-white font-semibold">
                Order again
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
