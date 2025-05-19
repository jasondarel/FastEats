import React from "react";

const OrderItems = ({ menuItems, order, formatCurrency, API_URL }) => {
  const isCartOrder =
    order.order_type === "CART" &&
    Array.isArray(menuItems) &&
    menuItems.length > 0;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-amber-900">Order Items</h2>

      {isCartOrder ? (
        <div className="space-y-4">
          {menuItems.map((menuItem, index) => (
            <div
              key={menuItem.menu_id}
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
                x1
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-amber-100">
          <img
            src={
              order.menu?.menu_image
                ? `${API_URL}/restaurant/uploads/menu/${order.menu.menu_image}`
                : "/api/placeholder/80/80"
            }
            alt={order.menu?.menu_name || "Menu Item"}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold text-amber-900">
              {order.menu?.menu_name || "Menu Item"}
            </div>
            <div className="text-sm text-amber-700 mb-2">
              {order.menu?.menu_description || ""}
            </div>
            <div className="text-amber-900 font-semibold">
              {order.menu?.menu_price
                ? formatCurrency(order.menu.menu_price)
                : "N/A"}
            </div>
          </div>
          <div className="bg-amber-100 px-4 py-2 rounded-lg font-semibold text-amber-900">
            x{order.item_quantity || 1}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItems;
