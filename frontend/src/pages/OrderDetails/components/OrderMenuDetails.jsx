import React from "react";

const OrderMenuDetails = ({ order }) => {
  return (
    <>
      {/* Menu Image */}
      {order.menu.menu_image && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg">
          <img
            src={`http://localhost:5000/restaurant/uploads/menu/${order.menu.menu_image}`}
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
};

export default OrderMenuDetails;
