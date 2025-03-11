import axios from "axios";
import { API_URL } from "../../config/api";

const cancelOrderService = async (orderId, token) => {
  const response = await axios.patch(
    `${API_URL}/order/cancel-order/${orderId}`,
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
    `${API_URL}/order/pay-order-confirmation`,
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
    `${API_URL}/order/save-snap-token`,
    {
      order_id: orderId,
      snap_token: snapToken,
    }
  );
  return response;
};

const checkMidtransStatusService = async (orderId) => {
  const statusResponse = await axios.get(
    `${API_URL}/order/check-midtrans-status?order_id=${orderId}`
  );
  return statusResponse;
};

const getOrderDetailService = async (orderId, token) => {
  const response = await axios.get(
    `${API_URL}/order/orders/${orderId}`,
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
