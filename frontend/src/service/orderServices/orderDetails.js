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
  const response = await axios.post(`${API_URL}/order/save-snap-token`, {
    order_id: orderId,
    snap_token: snapToken,
  });
  return response;
};

const checkMidtransStatusService = async (orderId) => {
  const statusResponse = await axios.get(
    `${API_URL}/order/check-midtrans-status?order_id=${orderId}`
  );
  return statusResponse;
};

const getOrderDetailService = async (orderId, token) => {
  const response = await axios.get(`${API_URL}/order/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

const getCartService = async (cartId, token) => {
  try {
    const response = await axios.get(`${API_URL}/cart/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

const createCartService = async (restaurantId, token) => {
  const response = await axios.post(
    `${API_URL}/order/cart`,
    {
      restaurantId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log("createCartService response:", response.data);
  return response;
};

const createCartItemService = async (cartId, menuId, quantity, note, token) => {
  const response = await axios.post(
    `${API_URL}/order/cart-item`,
    {
      cartId,
      menuId,
      quantity,
      note: note || "",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log("createCartItemService response:", response.data);
  return response;
};

const deleteCartItemService = async (cartItemId, token) => {
  const response = await axios.delete(
    `${API_URL}/order/cart-item/${cartItemId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

const updateCartItemQuantityService = async (cartItemId, quantity, token) => {
  const response = await axios.put(
    `${API_URL}/order/cart-item/${cartItemId}`,
    {
      quantity: quantity,
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

export {
  cancelOrderService,
  payConfirmationService,
  saveSnapService,
  checkMidtransStatusService,
  getOrderDetailService,
  getCartService,
  createCartService,
  createCartItemService,
  deleteCartItemService,
  updateCartItemQuantityService,
};
