/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { API_URL } from "../../../config/api";

const OrderMenuDetails = ({ order }) => {
  if (order.order_type === "CHECKOUT") {
    return (
      <>
        {order.menu.menu_image && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg">
            <img
              src={`${API_URL}/restaurant/uploads/menu/${order.menu.menu_image}`}
              alt={order.menu.menu_name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4 bg-gradient-to-r from-amber-50 to-white p-6 rounded-lg">
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Menu Name</span>
            <span className="text-amber-900">{order.menu.menu_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Menu Category</span>
            <span className="text-amber-900">{order.menu.menu_category}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Price per Item</span>
            <span className="text-amber-900">
              Rp {parseFloat(order.menu.menu_price).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Quantity</span>
            <span className="text-amber-900">{order.item_quantity}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Total Price</span>
            <span className="text-amber-900">
              Rp{" "}
              {(
                parseFloat(order.menu.menu_price) * order.item_quantity
              ).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {order.menu.menu_description && (
          <div className="mt-8 p-4 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-700 font-medium mb-2">
              Menu Description
            </div>
            <p className="text-amber-900">{order.menu.menu_description}</p>
          </div>
        )}
      </>
    );
  } else if (order.order_type === "CART") {
    return (
      <div className="space-y-6">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-amber-50 to-white p-6 rounded-lg"
          >
            {item.menu.menu_image && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <img
                  src={`${API_URL}/restaurant/uploads/menu/${item.menu.menu_image}`}
                  alt={item.menu.menu_name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">Menu Name</span>
                <span className="text-amber-900">{item.menu.menu_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">
                  Menu Category
                </span>
                <span className="text-amber-900">
                  {item.menu.menu_category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">
                  Price per Item
                </span>
                <span className="text-amber-900">
                  Rp {parseFloat(item.menu.menu_price).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">Quantity</span>
                <span className="text-amber-900">{item.item_quantity}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">Total Price</span>
                <span className="text-amber-900">
                  Rp{" "}
                  {(
                    parseFloat(item.menu.menu_price) * item.item_quantity
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {item.menu.menu_description && (
              <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                <div className="text-sm text-amber-700 font-medium mb-2">
                  Menu Description
                </div>
                <p className="text-amber-900">{item.menu.menu_description}</p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-8 p-6 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl shadow-sm border border-amber-200">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7c0-2.21 3.582-4 8-4s8 1.79 8 4v7c0 2.21-3.582 4-8 4z"
              />
            </svg>
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <span className="text-amber-700 font-medium">Total Items</span>
              <span className="text-amber-900 font-semibold">
                {order.items.reduce((sum, item) => sum + item.item_quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <span className="text-amber-700 font-medium">Subtotal</span>
              <span className="text-amber-900 font-semibold">
                Rp{" "}
                {order.items
                  .reduce(
                    (sum, item) =>
                      sum + parseFloat(item.menu.menu_price) * item.item_quantity,
                    0
                  )
                  .toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-amber-100 pb-2">
              <span className="text-amber-700 font-medium">Tax</span>
              <span className="text-amber-900 font-semibold">
                Rp {(2000).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-amber-300">
              <span className="text-lg font-bold text-amber-800">Total</span>
              <span className="text-lg font-bold text-amber-900">
                Rp{" "}
                {(
                  order.items
                    .reduce(
                      (sum, item) =>
                        sum + parseFloat(item.menu.menu_price) * item.item_quantity,
                      0
                    ) + 2000
                ).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OrderMenuDetails;
