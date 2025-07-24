/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  cancelOrderService,
  payConfirmationService,
  saveSnapService,
  checkMidtransStatusService,
  getOrderDetailService,
} from "../../service/orderServices/orderDetails";
import {
  createChatService,
  getChatsService,
} from "../../service/chatServices/chatsListService";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import StatusBadge from "../../components/StatusBadge";
import OrderStatusAnimation from "./components/OrderStatusAnimation";
import OrderDateInfo from "./components/OrderDateInfo";
import OrderMenuDetails from "./components/OrderMenuDetails";
import OrderActions from "./components/OrderActions";
import OrderTimestamp from "./components/OrderTimestamp";
import OrderShipping from "./components/OrderShipping";
import RestaurantRating from './components/RestaurantRating';
import Swal from "sweetalert2";
import LoadingState from "../../components/LoadingState";
import { API_URL, ORDER_URL } from "../../config/api";
import { MIDTRANS_SNAP_URL } from "../../config/api";
import io from "socket.io-client";
import OrderSummary from "./components/OrderSummary";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isShippingValid, setIsShippingValid] = useState(true);
  const [shippingData, setShippingData] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [paymentDeadline, setPaymentDeadline] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [ttlFetched, setTtlFetched] = useState(false); 
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);
  const countdownRef = useRef(null); 

  const handleShippingValidationChange = useCallback((isValid) => {
    console.log("Shipping validation changed:", isValid);
    setIsShippingValid(isValid);
  }, []);

  const handleShippingDataChange = useCallback((data) => {
    console.log("Shipping data changed:", data);
    setShippingData(data);
  }, []);

  const handleCompleteOrder = async () => {
    try {
      const response = await fetch(
        `${API_URL}/order/complete-order/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Order completed successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#d97706",
        });
        const updatedOrderData = await response.json();
        setOrder(updatedOrderData);
        navigate("/orders");
      } else {
        throw new Error("Failed to complete order");
      }
    } catch (err) {
      console.error("Error completing order:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to complete the order. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d97706",
      });
    }
  };

  const handleCancel = async (orderId) => {
    Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep my order",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await cancelOrderService(orderId, token);

          Swal.fire(
            "Cancelled!",
            response.data.message || "Your order has been cancelled.",
            "success"
          ).then(() => {
            navigate("/orders");
          });
        } catch (err) {
          console.error("Error cancelling order:", err);
          setError(err.message || "Failed to cancel order");

          Swal.fire(
            "Error!",
            "Failed to cancel the order. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const handleChatWithRestaurant = async () => {
    try {
      console.log("Handling chat with order: ", order);
      const existingChatsResponse = await getChatsService(token);
      console.log("Existing chats response:", existingChatsResponse);

      if (existingChatsResponse.success) {
        const existingChat = existingChatsResponse.dataChats?.find(
          (chat) => String(chat.orderId) === String(orderId)
        );

        if (existingChat) {
          console.log("Chat already exists, navigating to:", existingChat._id);

          const itemCount =
            order.items?.reduce(
              (total, item) => total + (item.item_quantity || 0),
              0
            ) ||
            order.item_quantity ||
            1;

          const totalPrice =
            order.items?.reduce((total, item) => {
              const menuPrice = parseFloat(
                item.menu_price || 0
              );
              const quantity = item.item_quantity || 0;
              return total + menuPrice * quantity;
            }, 0) ||
            parseFloat(order.menu_price || 0) *
              (order.item_quantity || 1);
          navigate(`/chat/${existingChat._id}`, {
            state: {
              restaurantName:
                order.restaurant?.restaurant_name ||
                existingChat.restaurant?.restaurant_name,
              restaurantImage: order.restaurant?.restaurant_image
                ? `http://localhost:5000/restaurant/uploads/restaurant/${order.restaurant.restaurant_image}`
                : existingChat.restaurant?.restaurant_image
                ? `http://localhost:5000/restaurant/uploads/restaurant/${existingChat.restaurant.restaurant_image}`
                : null,
              orderId: order.order_id,
              orderType: order.order_type || "CHECKOUT",
              totalPrice,
              itemCount,
            },
          });
          return;
        }
      }

      const chatResult = await createChatService(orderId, token);
  
      if (chatResult.success && chatResult.dataChat?.chat) {
        const chatId = chatResult.dataChat.chat._id;

        const itemCount =
          order.items?.reduce(
            (total, item) => total + (item.item_quantity || 0),
            0
          ) ||
          order.item_quantity ||
          1;

        const totalPrice =
          order.items?.reduce((total, item) => {
            const menuPrice = parseFloat(
              item.menu_price || item.menu?.menu_price || 0
            );
            const quantity = item.item_quantity || 0;
            return total + menuPrice * quantity;
          }, 0) ||
          parseFloat(order.menu_price || 0) * (order.item_quantity || 1);

        navigate(`/chat/${chatId}`, {
          state: {
            restaurantName: order.restaurant?.restaurant_name,
            restaurantImage: order.restaurant?.restaurant_image
              ? `http://localhost:5000/restaurant/uploads/restaurant/${order.restaurant.restaurant_image}`
              : null,
            orderId: order.order_id,
            orderType: order.order_type || "CHECKOUT",
            totalPrice,
            itemCount,
          },
        });
      } else {
        throw new Error("Failed to create chat - invalid response");
      }
    } catch (error) {
      console.error("Error handling chat with restaurant:", error);

      Swal.fire({
        title: "Error",
        text: "Failed to open chat with restaurant. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await getOrderDetailService(orderId, token);

      console.log("Order data received:", response.data);
      if (response.data.success && response.data.order) {
        console.log("Setting order state with:", response.data.order);
        setOrder(response.data.order);
      } else {
        throw new Error("No order data received");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const handleOrderUpdate = useCallback(
    (updatedOrder) => {
      console.log("=== SOCKET ORDER UPDATE ===");
      console.log("Updated order received:", updatedOrder);
      console.log("Current orderId from params:", orderId);
      console.log("Updated order ID:", updatedOrder.order_id);
      console.log(
        "ID comparison:",
        String(updatedOrder.order_id) === String(orderId)
      );

      if (String(updatedOrder.order_id) === String(orderId)) {
        console.log("✅ IDs match, updating order state...");

        setOrder((prevOrder) => {
          console.log("Previous order state:", prevOrder);

          const newOrder = {
            ...prevOrder,
            ...updatedOrder,
            updated_at: updatedOrder.completed_at || updatedOrder.delivering_at,
            menu: updatedOrder.menu
              ? { ...prevOrder?.menu, ...updatedOrder.menu }
              : prevOrder?.menu,
            restaurant: updatedOrder.restaurant
              ? { ...prevOrder?.restaurant, ...updatedOrder.restaurant }
              : prevOrder?.restaurant,
          };

          console.log("New order state:", newOrder);
          console.log("=== END SOCKET UPDATE ===");
          return newOrder;
        });

        setForceUpdate((prev) => prev + 1);

        if (updatedOrder.status?.toLowerCase() !== "pending") {
          setPaymentDeadline(null);
          setTtlFetched(false);
          setCountdown(null);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
        }
      } else {
        console.log("❌ Order IDs don't match - ignoring update");
        console.log("=== END SOCKET UPDATE ===");
      }
    },
    [orderId]
  );

  useEffect(() => {
    const snapScript = MIDTRANS_SNAP_URL;
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayConfirmation = async (orderId, itemQuantity, itemPrice) => {
    try {
      setPaymentLoading(true);

      const response = await payConfirmationService(
        orderId,
        itemQuantity,
        itemPrice,
        shippingData.shippingData.province,
        shippingData.shippingData.city,
        shippingData.shippingData.district,
        shippingData.shippingData.village,
        shippingData.shippingData.address,
        shippingData.shippingData.phone,
        shippingData.shippingData.fullName,
        token
      );

      if (response.data.success) {
        const snapToken = response.data.data.token;
        console.log("Snap Token:", snapToken);
        window.snap.pay(snapToken, {
          skipOrderSummary: true,
          showOrderId: true,

          onSuccess: async function (result) {
            console.log("success", result);

            try {
              alert("Pembayaran berhasil!");
              await fetchOrderDetails();
            } catch (chatError) {
              console.error("Failed to create chat:", chatError);
              alert(
                "Pembayaran berhasil! Namun terjadi masalah saat membuat chat."
              );
            }
            setPaymentLoading(false);
          },

          onPending: async function (result) {
            try {
              const response = await saveSnapService(orderId, snapToken);
              alert(
                "Pembayaran sedang diproses. Silakan cek status pembayaran di halaman transaksi."
              );
              setPaymentLoading(false);
            } catch (err) {
              console.error("Error saving snap token:", err);
              setPaymentLoading(false);
            }
          },

          onError: function (result) {
            console.log("error", result);
            alert("Terjadi kesalahan dalam proses pembayaran.");
            setPaymentLoading(false);
          },

          onClose: async function () {
            try {
              const statusResponse = await checkMidtransStatusService(orderId);

              if (statusResponse.data.transaction_status === "pending") {
                alert(
                  "Anda sudah memilih metode pembayaran, silakan lanjutkan pembayaran di halaman transaksi."
                );
              } else {
                alert("Pembayaran dibatalkan. Silakan coba lagi.");
              }
            } catch (error) {
              console.error("Error checking transaction status:", error);
            }
            setPaymentLoading(false);
          },
        });
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError(err.message || "Failed to confirm payment");
      setPaymentLoading(false);
    }
  };

  const handleOrderAgain = async () => {
    if (order && order.menu) {
      navigate(`/menu/${order.menu.menu_id}`);
    } else {
      navigate("/menu");
    }
  };

  const handlePayment = async () => {
    const orderId = order.order_id;

    if (!orderId) return;

    try {
      const response = await fetch(`${API_URL}/order/snap/${orderId}`);
      const data = await response.json();

      if (data?.snap_token) {
        window.snap.pay(data.snap_token);
      } else {
        alert("Failed to get transaction token.");
      }
    } catch (error) {
      console.error("Error fetching transaction token:", error);
      alert("Error processing payment.");
    }
  };

  useEffect(() => {
    if (!token || !orderId) {
      console.log("Missing token or orderId, skipping socket connection");
      return;
    }

    console.log("Initializing socket connection...");
    console.log("ORDER_URL:", ORDER_URL);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("OrderId:", orderId);
    
    socketRef.current = io(API_URL, {
      path: "/order/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token: token,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected successfully");
      console.log("Socket ID:", socketRef.current.id);

      socketRef.current.emit("joinOrder", orderId);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    socketRef.current.on("orderUpdated", handleOrderUpdate);

    socketRef.current.on("orderCompleted", (completedOrder) => {
      console.log("Order completed event received:", completedOrder);
      if (String(completedOrder.order_id) === String(orderId)) {
        handleOrderUpdate(completedOrder);
      }
    });

    socketRef.current.on("orderDelivering", (deliveringOrder) => {
      console.log("Order delivering event received:", deliveringOrder);
      if (String(deliveringOrder.order_id) === String(orderId)) {
        handleOrderUpdate(deliveringOrder);
      }
    });

    socketRef.current.on("statusChanged", (statusUpdate) => {
      console.log("Status change event received:", statusUpdate);
      if (String(statusUpdate.order_id) === String(orderId)) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          status: statusUpdate.status,
          updated_at: statusUpdate.updated_at || new Date().toISOString(),
        }));
      }
    });

    return () => {
      console.log("Cleaning up socket connection...");
      if (socketRef.current) {
        socketRef.current.off("orderUpdated", handleOrderUpdate);
        socketRef.current.off("orderCompleted");
        socketRef.current.off("orderDelivering");
        socketRef.current.off("statusChanged");
        socketRef.current.disconnect();
      }
    };
  }, [token, orderId, handleOrderUpdate]);

  useEffect(() => {
    console.log("Fetching details for order ID:", orderId);
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  useEffect(() => {
    console.log("🔄 Order state updated:", order);
  }, [order, forceUpdate]);

  const shouldShowShipping =
    order && ["Waiting", "Pending"].includes(order.status);

  useEffect(() => {
    const fetchDeadlineOnce = async () => {
      if (
        order &&
        order.status?.toLowerCase() === "pending" &&
        !ttlFetched &&
        token
      ) {
        console.log("Fetching TTL deadline for order:", order.order_id);
        setTtlFetched(true);
        
        try {
          const res = await fetch(`${API_URL}/order/ttl-order/${order.order_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          
          if (typeof data.ttl === "number" && data.ttl > 0) {
            const deadline = new Date(Date.now() + data.ttl * 1000);
            console.log("Payment deadline set to:", deadline);
            setPaymentDeadline(deadline);
          } else {
            console.log("Invalid TTL received:", data.ttl);
            setPaymentDeadline(null);
          }
        } catch (err) {
          console.error("Error fetching TTL:", err);
          setPaymentDeadline(null);
        }
      } else if (order?.status?.toLowerCase() !== "pending") {
        setPaymentDeadline(null);
        setTtlFetched(false);
        setCountdown(null);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    };

    fetchDeadlineOnce();
  }, [order?.order_id, order?.status, ttlFetched, token]);

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (!paymentDeadline) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = paymentDeadline - now;
      
      if (diff <= 0) {
        setCountdown("00:00:00");
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        return false;
      } else {
        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setCountdown(`${hours}:${minutes}:${seconds}`);
        return true;
      }
    };

    if (updateCountdown()) {
      countdownRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [paymentDeadline]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen bg-amber-50">
        <Sidebar />
        <div className="flex-grow max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <BackButton to="/orders" />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-700">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchOrderDetails();
                }}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen bg-amber-50">
      <Sidebar />
      <div className="flex-grow max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <BackButton to="/orders" />
        </div>

        {order && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-amber-900">
                Order #{order.order_id}
              </h1>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={order.status}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                />
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            <OrderStatusAnimation status={order.status} />

            {order.status?.toLowerCase() === "pending" && countdown && (
              <div className="text-center text-red-600 font-bold mb-4">
                Payment Deadline: {countdown}
              </div>
            )}

            {["preparing", "delivering"].includes(
              order.status?.toLowerCase()
            ) && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={handleChatWithRestaurant}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Chat with Restaurant
                </button>
              </div>
            )}

            <OrderDateInfo
              createdAt={order.created_at}
              updatedAt={order.updated_at}
            />

            <div className="border-t border-amber-200 pt-6">
              <h2 className="text-xl font-semibold mb-6 text-amber-900">
                Order Details
              </h2>

              <OrderMenuDetails order={order} />

              {shouldShowShipping && (
                <OrderShipping
                  onShippingValidationChange={handleShippingValidationChange}
                  onShippingDataChange={handleShippingDataChange}
                />
              )}
            </div>

            {isShippingValid && (
              <OrderSummary order={order}/>
            )}

            <OrderTimestamp createdAt={order.created_at} />

            <div className="flex justify-end gap-4">
              {order.status.toLowerCase() === "delivering" && (
                <button
                  className="mt-8 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 hover:cursor-pointer transition"
                  onClick={handleCompleteOrder}
                >
                  Complete Order
                </button>
              )}
            </div>

             <div className="mt-8 flex justify-end gap-4">
              {order.status.toLowerCase() === "completed" && (
               <RestaurantRating 
                  order={order} 
                  onSubmitRating={async (ratingData) => {
                    try {
                      const response = await fetch(`${API_URL}/order/rate-restaurant`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(ratingData),
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to submit rating');
                      }
                      
                      Swal.fire({
                        title: 'Thank you!',
                        text: 'Your rating has been submitted successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d97706',
                      });
                    } catch (error) {
                      console.error('Error submitting rating:', error);
                      Swal.fire({
                        title: 'Error!',
                        text: 'Failed to submit rating. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d97706',
                      });
                      throw error; 
                    }
                  }}
                />
              )}
            </div>

            <div className="mt-8">
              <OrderActions
                order={order}
                paymentLoading={paymentLoading}
                isShippingValid={isShippingValid}
                onCancel={handleCancel}
                onPayConfirmation={handlePayConfirmation}
                onPayment={handlePayment}
                onOrderAgain={handleOrderAgain}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;