import axios from "axios";

const cancelOrderService = async (orderId, token) => {
  const response = await axios.patch(
    `http://localhost:5000/order/cancel-order/${orderId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

const payConfirmationService = async (
  orderId,
  itemQuantity,
  itemPrice,
  token
) => {
  const response = await axios.post(
    "http://localhost:5000/order/pay-order-confirmation",
    {
      order_id: orderId,
      itemQuantity: itemQuantity,
      itemPrice: itemPrice,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

const saveSnapService = async (orderId, snapToken) => {
  const response = await axios.post(
    "http://localhost:5000/order/save-snap-token",
    {
      order_id: orderId,
      snap_token: snapToken,
    }
  );
  return response;
};

const checkMidtransStatusService = async (orderId) => {
  const statusResponse = await axios.get(
    `http://localhost:5000/order/check-midtrans-status?order_id=${orderId}`
  );
  return statusResponse;
};

const getOrderDetailService = async (orderId, token) => {
  const response = await axios.get(
    `http://localhost:5000/order/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

export {
  cancelOrderService,
  payConfirmationService,
  saveSnapService,
  checkMidtransStatusService,
  getOrderDetailService
};
