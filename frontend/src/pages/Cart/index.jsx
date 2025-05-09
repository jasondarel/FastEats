import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import CartItem from "./components/CartItem";
import YellowBackgroundLayout from "./components/Background";
import { API_URL } from "../../config/api";

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
  try {
    const response = await axios.post(
      `${API_URL}/cart`,
      {
        restaurantId: restaurantId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

const createCartItemService = async (cartId, menuId, quantity, note, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/cart-item`,
      {
        cartId,
        menuId,
        quantity,
        note,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
};

const deleteCartItemService = async (cartItemId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/cart-item/${cartItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const urlParams = new URLSearchParams(window.location.search);
    const cartIdFromUrl = urlParams.get("cartId");
    const storedCartId = localStorage.getItem("cartId");
    const currentCartId = cartIdFromUrl || storedCartId;

    if (currentCartId) {
      setCartId(currentCartId);
      fetchCartItems(currentCartId);
    } else {
      setLoading(false);
    }

    const restaurantIdFromUrl = urlParams.get("restaurantId");
    if (restaurantIdFromUrl) {
      setRestaurantId(restaurantIdFromUrl);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchCartItems = async (cartIdToFetch) => {
    try {
      setLoading(true);
      const token = getToken();
      console.log("Fetching cart with ID:", cartIdToFetch);
      const response = await getCartService(cartIdToFetch, token);
      console.log("Cart API response:", response);

      if (response.success) {
        setCartItems(response.cart || []);
        console.log("Cart items set:", response.cart);
      } else {
        setError(response.message || "Failed to fetch cart");
        console.error("API returned error:", response.message);
      }
    } catch (err) {
      setError("Error loading cart items. Please try again.");
      console.error("Error fetching cart items:", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewCart = async () => {
    if (!restaurantId) {
      setError("Restaurant ID is required to create a cart");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await createCartService(restaurantId, token);

      if (response.success && response.cartItem) {
        setCartId(response.cartItem.cart_id);
        localStorage.setItem("cartId", response.cartItem.cart_id);
        await fetchCartItems(response.cartItem.cart_id);
      } else {
        setError(response.message || "Failed to create cart");
      }
    } catch (err) {
      setError("Error creating cart. Please try again.");
      console.error("Error creating cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, menuId, newQuantity, note) => {
    if (newQuantity < 1) return;

    try {
      const token = getToken();

      await deleteCartItemService(cartItemId, token);

      if (newQuantity > 0) {
        await createCartItemService(cartId, menuId, newQuantity, note, token);
      }

      await fetchCartItems(cartId);
    } catch (err) {
      setError("Error updating quantity. Please try again.");
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const token = getToken();
      await deleteCartItemService(cartItemId, token);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cart_item_id !== cartItemId)
      );
    } catch (err) {
      setError("Error removing item. Please try again.");
      console.error("Error removing item:", err);
    }
  };

  const removeAllItems = async () => {
    try {
      const token = getToken();
      const deletePromises = cartItems.map((item) =>
        deleteCartItemService(item.cart_item_id, token)
      );

      await Promise.all(deletePromises);
      setCartItems([]);
    } catch (err) {
      setError("Error removing all items. Please try again.");
      console.error("Error removing all items:", err);
    }
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    window.location.href = `/checkout?cartId=${cartId}`;
  };

  return (
    <YellowBackgroundLayout>
      <div className="w-full max-w-xl p-6 bg-white shadow-xl rounded-xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-yellow-600 mb-4 flex items-center justify-center">
          <FaShoppingCart className="mr-3" /> My Cart
        </h2>

        {error && (
          <div className="mb-4 bg-red-100 p-3 rounded-lg border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaShoppingCart className="text-yellow-500 text-xl mr-3" />
              <div>
                <h3 className="font-medium">Your Shopping Cart</h3>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading..."
                    : `${totalItems} items ready for checkout`}
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={removeAllItems}
                className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
              >
                <FaTrash className="mr-1" /> Remove all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-yellow-600">Loading cart items...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 overflow-x-hidden min-h-0">
            {!cartId && restaurantId && (
              <div className="text-center py-8">
                <p className="font-medium mb-4">No cart found</p>
                <button
                  onClick={createNewCart}
                  className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                >
                  Create New Cart
                </button>
              </div>
            )}

            {cartId && cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium mb-2">Your cart is empty</p>
                <p className="text-sm">
                  Add items from the menu to get started
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.cart_item_id}
                  item={item}
                  onUpdateQuantity={(newQuantity) =>
                    updateQuantity(
                      item.cart_item_id,
                      item.menu_id,
                      newQuantity,
                      item.note
                    )
                  }
                  onRemoveItem={() => removeItem(item.cart_item_id)}
                />
              ))
            )}
          </div>
        )}

        {cartId && cartItems.length > 0 && (
          <>
            <hr className="my-4 border-gray-300" />
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">Subtotal</h3>
                <p className="text-sm text-gray-600">{totalItems} items</p>
              </div>
              <div className="text-yellow-600 font-bold text-xl">
                Rp {subtotal.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                onClick={handleCheckout}
                disabled={loading}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </YellowBackgroundLayout>
  );
};

export default Cart;
