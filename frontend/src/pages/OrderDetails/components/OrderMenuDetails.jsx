/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { API_URL } from "../../../config/api";

const OrderMenuDetails = ({ order }) => {
  if (order.order_type === "CHECKOUT") {
    return (
      <>
        {order.menu_image && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg">
            <img
              src={`${API_URL}/restaurant/uploads/menu/${order.menu_image}`}
              alt={order.menu_name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4 bg-gradient-to-r from-amber-50 to-white p-6 rounded-lg">
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Menu Name</span>
            <span className="text-amber-900">{order.menu_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Menu Category</span>
            <span className="text-amber-900">{order.menu_category}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-amber-100">
            <span className="text-amber-700 font-medium">Price per Item</span>
            <span className="text-amber-900">
              Rp {parseFloat(order.menu_price).toLocaleString("id-ID")}
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
                parseFloat(order.menu_price) * order.item_quantity
              ).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {order.menu_description && (
          <div className="mt-8 p-4 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-700 font-medium mb-2">
              Menu Description
            </div>
            <p className="text-amber-900">{order.menu_description}</p>
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
            {item.menu_image && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <img
                  src={`${API_URL}/restaurant/uploads/menu/${item.menu_image}`}
                  alt={item.menu_name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">Menu Name</span>
                <span className="text-amber-900">{item.menu_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">
                  Menu Category
                </span>
                <span className="text-amber-900">
                  {item.menu_category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-100">
                <span className="text-amber-700 font-medium">
                  Price per Item
                </span>
                <span className="text-amber-900">
                  Rp {parseFloat(item.menu_price).toLocaleString("id-ID")}
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
                    parseFloat(item.menu_price) * item.item_quantity
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {item.menu_description && (
              <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                <div className="text-sm text-amber-700 font-medium mb-2">
                  Menu Description
                </div>
                <p className="text-amber-900">{item.menu_description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default OrderMenuDetails;
