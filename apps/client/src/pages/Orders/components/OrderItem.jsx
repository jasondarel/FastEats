/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaSync } from "react-icons/fa";
import StatusBadge from "../../../components/StatusBadge";
import { API_URL } from "../../../config/api";
import axios from "axios";

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";

const OrderItem = ({ order, onOrderClick, onOrderAgain }) => {
  const navigate = useNavigate();
  const [menuDetails, setMenuDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [orderWithAddons, setOrderWithAddons] = useState(null);
  const token = localStorage.getItem("token");
  const [addonPrice, setAddonPrice] = useState(0);

  const calculateTotalPrice = () => {
    if (!order.items || order.items.length === 0 || !menuDetails) return 0;

    const menuTotal = order.items.reduce((total, item) => {
      const menu = menuDetails[item.menu_id];
      if (menu && menu.menu_price) {
        return total + menu.menu_price * (item.item_quantity || 1);
      }
      return total;
    }, 0);

    return menuTotal + addonPrice;
  };

  const getItemAddonNames = (item) => {
    if (!item.addons || item.addons.length === 0) return "";
    
    const addonNames = [];
    item.addons.forEach(category => {
      if (category.addons && category.addons.length > 0) {
        category.addons.forEach(addon => {
          const quantity = addon.quantity > 1 ? ` (${addon.quantity}x)` : "";
          addonNames.push(`${addon.addon_name}${quantity}`);
        });
      }
    });
    
    return addonNames.length > 0 ? addonNames.join(", ") : "";
  };

  const getItemAddonPrice = (item) => {
    if (!item.addons || item.addons.length === 0) return 0;
    
    let itemAddonTotal = 0;
    item.addons.forEach(category => {
      if (category.addons && category.addons.length > 0) {
        category.addons.forEach(addon => {
          const price = parseFloat(addon.addon_price) || 0;
          const quantity = addon.quantity || 1;
          itemAddonTotal += price * quantity;
        });
      }
    });
    
    return itemAddonTotal;
  };

  const getItemTotalPrice = (item, menu) => {
    const menuPrice = menu?.menu_price || 0;
    const quantity = item.item_quantity || 1;
    const addonPrice = getItemAddonPrice(item);
    
    return (menuPrice * quantity) + addonPrice;
  };

  useEffect(() => {
    const fetchMenuDetails = async () => {
      const details = {};
      const res = await axios.get(
        `${API_URL}/order/order-items/${order.order_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const orderItems = res.data.order || {};
      console.log("Fetched order items:", orderItems);

      setOrderWithAddons(orderItems);

      if (orderItems.addon_price !== undefined) {
        order.addon_price = orderItems.addon_price;
      }

      if (orderItems.items) {
        orderItems.items.forEach((item) => {
          if (item.menu_id && !details[item.menu_id]) {
            details[item.menu_id] = item;
          }
        });
      }

      setAddonPrice(orderItems.addon_price || 0);
      setMenuDetails(details);
      setLoading(false);
    };

    fetchMenuDetails();
  }, [order.items, token, order.order_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const showOrderAgainButton =
    order.status === "Completed" || order.status === "Cancelled";

  const totalItems = order.items?.reduce(
    (sum, item) => sum + (item.item_quantity || 0),
    0
  );

  const orderTotalPrice =
    order.total_price || order.total || calculateTotalPrice() || 0;

  useEffect(() => {
    if (!loading && order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      const menu = menuDetails[firstItem?.menu_id];
    }
  }, [loading, menuDetails, order.items]);

  return (
    <div
      className="my-3 px-4 py-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onOrderClick(order.order_id)}
    >
      <div className="flex justify-between gap-x-2">
        <div className="flex">
          <div className="flex items-center mr-3">
            <FaShoppingBag className="text-yellow-600 text-lg" />
          </div>
          <div>
            <h4 className="font-bold leading-3 text-sm">Order #{order.order_id}</h4>
            <p className="text-sm text-slate-700">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <StatusBadge
            status={order.status}
            className="px-2 py-1 rounded-md font-semibold text-sm"
          />
        </div>
      </div>

      <hr className="my-3 border-gray-300" />

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-2 text-gray-500">
            Loading menu details...
          </div>
        ) : (
          <>
            {orderWithAddons?.items?.slice(0, 2).map((item, idx) => {
              const menu = menuDetails[item.menu_id];
              const addonNames = getItemAddonNames(item);
              console.log("Menu details for item:", menu);
              console.log("Addon names for item:", addonNames);
              
              return (
                <div className="flex" key={item.order_item_id || idx}>
                  <img
                    src={
                      menu?.menu_image
                        ? menu.menu_image.startsWith("http")
                          ? menu.menu_image
                          : `${API_URL}/restaurant/uploads/menu/${menu.menu_image}`
                        : placeholderImage
                    }
                    alt={menu?.menu_name || "Menu item"}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      console.log("Image failed to load:", e.target.src);
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
                  />
                  <div className="pt-2 pl-4 flex-1 min-w-0">
                    <h2 className="font-bold truncate text-base md:text-lg">
                      {menu?.menu_name || `Menu #${item.menu_id}`}
                    </h2>
                    <div className="flex justify-between">
                      <div>
                        {addonNames && (
                          <p className="text-xs text-gray-500 mt-0.5 mb-1">
                            {addonNames}
                          </p>
                        )}
                        <p className="text-slate-600">
                          {item.item_quantity} Item{item.item_quantity !== 1 && "s"}
                        </p>
                        
                      </div>
                      <div className="text-right">
                        {menu?.menu_price && (
                          <>
                            <p className="text-yellow-600 font-medium">
                              {formatPrice(getItemTotalPrice(item, menu))}
                            </p>

                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {orderWithAddons?.items?.length > 2 && (
              <p className="text-sm text-gray-500">
                +{orderWithAddons.items.length - 2} more item(s)
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-3">
        <div className="flex flex-col">
          <h2 className="text-sm text-gray-600">Total Items</h2>
          <p className="font-bold text-yellow-600">{totalItems} Item(s)</p>
        </div>
        <div className="flex flex-col items-end">
          <h2 className="text-sm text-gray-600">Total Price</h2>
          <p className="font-bold text-yellow-600">
            {formatPrice(orderTotalPrice)}
          </p>
        </div>
        {showOrderAgainButton && (
          <div className="flex items-center justify-center ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderAgain(order);
                navigate(`/restaurant/${order.restaurant_id}/menu`);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1.5 rounded-lg text-white font-semibold text-sm transition-colors flex items-center cursor-pointer"
            >
              <FaSync className="mr-2" /> Order again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItem;