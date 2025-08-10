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
  shippingProvince,
  shippingCity,
  shippingDistrict,
  shippingVillage,
  shippingAddress,
  shippingPhone,
  shippingName,
  token
) => {
  const response = await axios.post(
    `${API_URL}/order/pay-order-confirmation`,
    {
      order_id: orderId,
      itemQuantity: itemQuantity,
      itemPrice: itemPrice,
      shipping_province: shippingProvince,
      shipping_city: shippingCity,
      shipping_district: shippingDistrict,
      shipping_village: shippingVillage,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      shipping_name: shippingName,
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
  const response = await axios.get(`${API_URL}/order/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

const getCartService = async (cartId, token) => {
  try {
    const response = await axios.get(`${API_URL}/order/cart/${cartId}`, {
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
  return response;
};

const createCartItemService = async (cartId, menuId, quantity, addsOn=null, token) => {
  const response = await axios.post(
    `${API_URL}/order/cart-item`,
    {
      cartId,
      menuId,
      quantity,
      addsOn: addsOn,
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

const getCartItemsService = async (cartId, token) => {
  const response = await axios.get(`${API_URL}/order/cart-item`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

const deleteCartItemService = async (menuId, itemId, token) => {
  const response = await axios.delete(`${API_URL}/order/cart-item/${menuId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      cart_item_id: itemId,
    },
  });
  return response;
};

const updateCartItemQuantityService = async (menuId, quantity, token) => {
  const response = await axios.put(
    `${API_URL}/order/cart-item/${menuId}`,
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
  getCartItemsService,
  createCartService,
  createCartItemService,
  deleteCartItemService,
  updateCartItemQuantityService,
};
