import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";

import CartItem from "./components/CartItem";
import YellowBackgroundLayout from "./components/Background";

const Cart = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Strawberry Dessert",
      image: "/cart1.png",
      price: 50000,
      quantity: 1,
      size: "250ml",
    },
    {
      id: 2,
      name: "Chocolate Cake",
      image: "/cart1.png",
      price: 45000,
      quantity: 1,
      size: "200g",
    },
    {
      id: 3,
      name: "Vanilla Ice Cream",
      image:
        "https://www.davidlebovitz.com/wp-content/uploads/2009/02/Vanilla-ice-cream-recipe-cherry-compote-4.jpg",
      price: 35000,
      quantity: 1,
      size: "150ml",
    },
    {
      id: 4,
      name: "Fruit Parfait",
      image: "/cart1.png",
      price: 55000,
      quantity: 1,
      size: "300ml",
    },
    {
      id: 5,
      name: "Mango Smoothie",
      image: "/cart1.png",
      price: 40000,
      quantity: 1,
      size: "350ml",
    },
  ]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const removeAllItems = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    console.log("Proceeding to checkout with items:", cartItems);
  };

  return (
    <YellowBackgroundLayout>
      <div className="w-full max-w-xl p-6 bg-white shadow-xl rounded-xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-yellow-600 mb-4 flex items-center justify-center">
          <FaShoppingCart className="mr-3" /> My Cart
        </h2>

        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaShoppingCart className="text-yellow-500 text-xl mr-3" />
              <div>
                <h3 className="font-medium">Your Shopping Cart</h3>
                <p className="text-sm text-gray-600">
                  {totalItems} items ready for checkout
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={removeAllItems}
                className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
              >
                <FaTrash className="mr-1" /> Remove all
              </button>
            )}
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto pr-2 overflow-x-hidden min-h-0">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium mb-2">Your cart is empty</p>
              <p className="text-sm">Add items from the menu to get started</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))
          )}
        </div>

        {}
        {cartItems.length > 0 && (
          <>
            <hr className="my-4 border-gray-300" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">Subtotal</h3>
                <p className="text-sm text-gray-600">{totalItems} items</p>
              </div>
              <div className="text-yellow-600 font-bold text-xl">
                Rp {subtotal.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </YellowBackgroundLayout>
  );
};

export default Cart;
