/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const OrderItems = ({ menuItems, order, formatCurrency, API_URL }) => {

  const getItemQuantity = (menuId) => {
    const targetItem = menuItems.find(item => item.menu_id === menuId);
    if (targetItem) {
      return targetItem.item_quantity || 1;
    }
    return 1;
  };

  const getTotalQuantity = () => {
    let total = 0;
    menuItems.forEach(item => {
      total += item.item_quantity;
    });
    return total;
  };

  const itemsToRender = menuItems || order.menu || [];

  if (Array.isArray(itemsToRender) && itemsToRender.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-amber-900">
          Order Items
        </h2>
        <div className="space-y-4">
          {itemsToRender.map((menuItem, index) => {
            const quantity = getItemQuantity(menuItem.menu_id);
            return (
              <div
                key={menuItem.menu_id || index}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-amber-100"
              >
                <img
                  src={
                    menuItem.menu_image
                      ? `${API_URL}/restaurant/uploads/menu/${menuItem.menu_image}`
                      : "/api/placeholder/80/80"
                  }
                  alt={menuItem.menu_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="text-lg font-semibold text-amber-900">
                    {menuItem.menu_name}
                  </div>
                  <div className="text-sm text-amber-700 mb-2">
                    {menuItem.menu_description}
                  </div>
                  <div className="text-amber-900 font-semibold">
                    {formatCurrency(menuItem.menu_price)}
                  </div>
                </div>
                <div className="bg-amber-100 px-4 py-2 rounded-lg font-semibold text-amber-900">
                  x{quantity}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-amber-700 font-medium">Total Items:</span>
            <span className="text-amber-900 font-semibold">
              {getTotalQuantity()}
            </span>
          </div>
        </div>
      </div>
    );
  } else if (
    itemsToRender &&
    typeof itemsToRender === "object" &&
    !Array.isArray(itemsToRender)
  ) {
    const quantity = order.item_quantity || 1;
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-amber-900">
          Order Items
        </h2>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-amber-100">
          <img
            src={
              itemsToRender.menu_image
                ? `${API_URL}/restaurant/uploads/menu/${itemsToRender.menu_image}`
                : "/api/placeholder/80/80"
            }
            alt={itemsToRender.menu_name || "Menu Item"}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold text-amber-900">
              {itemsToRender.menu_name || "Menu Item"}
            </div>
            <div className="text-sm text-amber-700 mb-2">
              {itemsToRender.menu_description || ""}
            </div>
            <div className="text-amber-900 font-semibold">
              {itemsToRender.menu_price
                ? formatCurrency(itemsToRender.menu_price)
                : "N/A"}
            </div>
          </div>
          <div className="bg-amber-100 px-4 py-2 rounded-lg font-semibold text-amber-900">
            x{quantity}
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-amber-700 font-medium">Total Items:</span>
            <span className="text-amber-900 font-semibold">
              {getTotalQuantity()}
            </span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-amber-900">
          Order Items
        </h2>
        <div className="p-4 bg-white rounded-lg shadow-sm border border-amber-100">
          <p className="text-amber-700">No order items available</p>
          <p className="text-xs text-gray-500 mt-2">
            Debug: menuItems type: {typeof menuItems}, isArray:{" "}
            {Array.isArray(menuItems)}, order_type: {order.order_type}
            <br />
            itemsToRender: {JSON.stringify(itemsToRender)}
          </p>
        </div>
      </div>
    );
  }
};

export default OrderItems;
