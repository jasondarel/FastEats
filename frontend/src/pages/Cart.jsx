import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

//backgroun
import bg from "../assets/cart-background.jpg";

//dummy image
import image from "../assets/cart1.png";
import trash from "../assets/trash.png";

const Cart = () => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div
      className="flex flex-col md:flex-row items-center justify-center min-h-screen overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)),url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Sidebar className="z-50 hidden md:block" />
      <div className="items-center justify-center py-4 px-6 bg-white rounded-md shadow-yellow-500 shadow-2xl md:ml-64 w-full md:w-auto lg:scale-[0.95] lg:my-5 xl:scale-100 xl:my-5">
        <div className="flex justify-between mb-10">
          <h2 className="font-semibold text-slate-700 sm:font-bold sm:text-lg md:text-2xl xl:text-3xl xl:my-5">
            Shopping Cart
          </h2>
          <h3 className="cursor-pointer text-red-500 underline font-medium text-sm flex items-center md:text-lg ">
            Remove all
          </h3>
        </div>

        {/* container cart */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row my-10">
            <div className="bg-transparent max-w-30 max-h-40">
              <img
                src={image}
                className="scale-120 sm:scale-120"
                alt="cart item"
              />
            </div>
            <div className="mx-6">
              <h2 className="text-2xl font-bold">Strawberry Dessert</h2>
              <p className="text-gray-600">250ml</p>
            </div>
            <div className="flex justify-center items-center mx-3">
              <button
                onClick={decreaseQuantity}
                className="bg-gray-400 text-black px-2 py-1 rounded-full cursor-pointer h-7 w-7 flex items-center justify-center"
              >
                -
              </button>
              <span className="px-2 bg-white text-lg font-semibold min-w-10 flex justify-center">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                className="bg-gray-400 text-black px-2 py-1 rounded-full cursor-pointer h-7 w-7 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <div className="pl-10 flex flex-col justify-end">
              <h2 className="font-extrabold text-xl text-right">$2.99</h2>
              <div className="flex justify-end items-end mt-10">
                <img
                  src={trash}
                  className="max-h-6 max-w-7.5 cursor-pointer mb-3 sm:scale-120"
                  alt="delete item"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <hr className="text-gray-600 w-full md:w-3/4"></hr>
        </div>
        <div className="flex justify-end gap-10 m-3">
          <div>
            <h2 className="font-bold text-lg">Sub-total</h2>
            <p className="text-gray-600">2 items</p>
          </div>
          <div className="font-extrabold text-3xl">
            <h3>$321</h3>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button className="bg-red-500 text-white rounded-2xl w-24 md:w-30 py-1 cursor-pointer lg:text-xl lg:font-semibold">
            Cancel
          </button>
          <button className="bg-green-700 text-white rounded-2xl w-32 md:w-40 py-1 cursor-pointer lg:text-xl lg:font-semibold">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
