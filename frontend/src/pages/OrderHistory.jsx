import React from "react";
import Sidebar from "../components/Sidebar";
import image from "../assets/orderHistory-dummy.jpg";

const OrderHistory = () => {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-hidden">
      <div className="md:w-auto">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow items-center mt-6 md:mt-0 md:ml-4 w-full">
        {/* Sticky Header */}
        <div className="w-full max-w-lg z-10 sticky top-0 py-4">
          <h2 className="text-4xl font-extrabold text-center text-yellow-600">
            Order History
          </h2>
          <hr className="border-t-2 border-gray-400 w-full max-w-lg my-4" />
        </div>

        {/* Scrollable Order List */}
        <div className="w-full max-w-lg h-[calc(100vh-120px)] overflow-y-auto p-3 lg:scale-125 lg:mt-10 lg:max-h-[580px] xl:mt-13 xl:scale-[1.3] xl:max-h-[570px]">
          {/* Order Item */}
          <div className="my-2 px-3 py-4 rounded-md shadow-sm shadow-slate-300">
            <div className="flex justify-between gap-x-2 md:gap-x-6 lg:gap-x-60">
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
                  <p className="text-sm text-slate-700">13 Nov 2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-300 px-1 py-0.5 rounded-md text-green-800 font-semibold text-sm">
                  Completed
                </div>
              </div>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex">
              <img
                src={image}
                alt="product"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div className="pt-3 pl-3 ">
                <h2 className="font-bold truncate max-w-[200px] md:max-w-80 overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
                  Minuman Yang Sangat Mantap banget
                </h2>

                <p className="text-slate-600">1 Item</p>
              </div>
            </div>
            <div className="flex justify-between mt-2 gap-x-2 md:gap-x-6 lg:gap-x-60">
              <div className="flex flex-col">
                <h2 className="text-sm">Total Order</h2>
                <p className="font-bold">$ 89.99</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-700 px-3 py-0.5 rounded-md text-white font-semibold text-sm">
                  Order again
                </div>
              </div>
            </div>
          </div>
          
          <div className="my-2 px-3 py-4 rounded-md shadow-sm shadow-slate-300">
            <div className="flex justify-between gap-x-2 md:gap-x-6 lg:gap-x-60">
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
                  <p className="text-sm text-slate-700">13 Nov 2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-300 px-1 py-0.5 rounded-md text-green-800 font-semibold text-sm">
                  Completed
                </div>
              </div>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex">
              <img
                src={image}
                alt="product"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div className="pt-3 pl-3 ">
                <h2 className="font-bold truncate max-w-[200px] md:max-w-80 overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
                  Minuman Yang Sangat Mantap banget
                </h2>

                <p className="text-slate-600">1 Item</p>
              </div>
            </div>
            <div className="flex justify-between mt-2 gap-x-2 md:gap-x-6 lg:gap-x-60">
              <div className="flex flex-col">
                <h2 className="text-sm">Total Order</h2>
                <p className="font-bold">$ 89.99</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-700 px-3 py-0.5 rounded-md text-white font-semibold text-sm">
                  Order again
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 px-3 py-4 rounded-md shadow-sm shadow-slate-300">
            <div className="flex justify-between gap-x-2 md:gap-x-6 lg:gap-x-60">
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
                  <p className="text-sm text-slate-700">13 Nov 2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-300 px-1 py-0.5 rounded-md text-green-800 font-semibold text-sm">
                  Completed
                </div>
              </div>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex">
              <img
                src={image}
                alt="product"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div className="pt-3 pl-3 ">
                <h2 className="font-bold truncate max-w-[200px] md:max-w-80 overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
                  Minuman Yang Sangat Mantap banget
                </h2>

                <p className="text-slate-600">1 Item</p>
              </div>
            </div>
            <div className="flex justify-between mt-2 gap-x-2 md:gap-x-6 lg:gap-x-60">
              <div className="flex flex-col">
                <h2 className="text-sm">Total Order</h2>
                <p className="font-bold">$ 89.99</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-700 px-3 py-0.5 rounded-md text-white font-semibold text-sm">
                  Order again
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 px-3 py-4 rounded-md shadow-sm shadow-slate-300">
            <div className="flex justify-between gap-x-2 md:gap-x-6 lg:gap-x-60">
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
                  <p className="text-sm text-slate-700">13 Nov 2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-300 px-1 py-0.5 rounded-md text-green-800 font-semibold text-sm">
                  Completed
                </div>
              </div>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex">
              <img
                src={image}
                alt="product"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              <div className="pt-3 pl-3 ">
                <h2 className="font-bold truncate max-w-[200px] md:max-w-80 overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
                  Minuman Yang Sangat Mantap banget
                </h2>

                <p className="text-slate-600">1 Item</p>
              </div>
            </div>
            <div className="flex justify-between mt-2 gap-x-2 md:gap-x-6 lg:gap-x-60">
              <div className="flex flex-col">
                <h2 className="text-sm">Total Order</h2>
                <p className="font-bold">$ 89.99</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-700 px-3 py-0.5 rounded-md text-white font-semibold text-sm">
                  Order again
                </div>
              </div>
            </div>
          </div>  
          
          
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
