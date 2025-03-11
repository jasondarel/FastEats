import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  cancelOrderService,
  payConfirmationService,
  saveSnapService,
  checkMidtransStatusService,
  getOrderDetailService,
} from "../../service/orderServices/orderDetails";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import StatusBadge from "../../components/StatusBadge";
import OrderStatusAnimation from "./components/OrderStatusAnimation";
import OrderDateInfo from "./components/OrderDateInfo";
import OrderMenuDetails from "./components/OrderMenuDetails";
import OrderActions from "./components/OrderActions";
import OrderTimestamp from "./components/OrderTimestamp";
import Swal from "sweetalert2";
import LoadingState from "../../components/LoadingState";
import { API_URL } from "../../config/api";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayConfirmation = async (orderId, itemQuantity, itemPrice) => {
    console.log("Confirming payment for order ID:", orderId);
    try {
      setPaymentLoading(true);

      const response = await payConfirmationService(
        orderId,
        itemQuantity,
        itemPrice,
        token
      );

      if (response.data.success) {
        const snapToken = response.data.data.token;
        console.log("Snap Token:", snapToken);
        window.snap.pay(snapToken, {
          skipOrderSummary: true,
          showOrderId: true,

          onSuccess: function (result) {
            console.log("success", result);
            alert("Pembayaran berhasil!");

            window.location.href = "/payment-success?order_id=" + orderId;
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
      const response = await fetch(
        `${API_URL}/order/snap/${orderId}`
      );
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
    console.log("Fetching details for order ID:", orderId);
    const fetchOrderDetails = async () => {
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
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <LoadingState />;
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
              <StatusBadge
                status={order.status}
                className="px-4 py-2 rounded-full text-sm font-medium"
              />
            </div>

            <OrderStatusAnimation status={order.status} />

            <OrderDateInfo
              createdAt={order.created_at}
              updatedAt={order.updated_at}
            />

            <div className="border-t border-amber-200 pt-6">
              <h2 className="text-xl font-semibold mb-6 text-amber-900">
                Order Details
              </h2>

              <OrderMenuDetails order={order} />
            </div>

            <OrderTimestamp createdAt={order.created_at} />

            <div className="mt-8">
              <OrderActions
                order={order}
                paymentLoading={paymentLoading}
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
