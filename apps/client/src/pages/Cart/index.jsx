/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import CartItem from "./components/CartItem";
import YellowBackgroundLayout from "./components/Background";
import {
  getCartService,
  createCartService,
  createCartItemService,
  deleteCartItemService,
  updateCartItemQuantityService,
} from "../../service/orderServices/orderDetails";
import { API_URL } from "../../config/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  const fetchCartItems = async () => {
    const token = getToken();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/order/cart-item`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("fetchCartItems response:", data);

      if (response.status === 404) {
        console.log("Cart is empty:", data.message);
        setCartItems([]);
      } else if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${
            data.message || "Unknown error"
          }`
        );
      } else if (
        data &&
        data.success === true &&
        Array.isArray(data.cartItems)
      ) {
        setCartItems(data.cartItems);
        if (data.cartItems.length > 0 && data.cartItems[0].cart_id) {
          setCartId(data.cartItems[0].cart_id);
          localStorage.setItem("cartId", data.cartItems[0].cart_id);
        }
      } else if (data && data.success === true && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        console.log("Unexpected data structure:", data);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError(`Failed to load cart items: ${error.message}`);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCartId = localStorage.getItem("cartId");
    if (storedCartId) {
      setCartId(storedCartId);
    }

    const storedRestaurantId = localStorage.getItem("restaurantId");
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const paramRestaurantId = urlParams.get("restaurantId");
      if (paramRestaurantId) {
        setRestaurantId(paramRestaurantId);
        localStorage.setItem("restaurantId", paramRestaurantId);
      }
    }

    setTimeout(() => {
      fetchCartItems();
    }, 100);
  }, []);

  const createNewCart = async () => {
    if (!restaurantId) {
      setError("Restaurant ID is required to create a cart");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await createCartService(restaurantId, token);

      if (response.data && response.data.success) {
        const newCartId =
          response.data.cartItem?.cart_id || response.data.cart?.id;
        if (newCartId) {
          setCartId(newCartId);
          localStorage.setItem("cartId", newCartId);
          await fetchCartItems(newCartId);
        } else {
          setError("Cart created but no cart ID returned");
        }
      } else {
        setError(response.data?.message || "Failed to create cart");
      }
    } catch (err) {
      setError("Error creating cart. Please try again.");
      console.error("Error creating cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (menuId, itemId) => {
    try {
      const token = getToken();
      await deleteCartItemService(menuId, itemId, token);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.menu_id !== menuId)
      );
    } catch (err) {
      setError("Error removing item. Please try again.");
      console.error("Error removing item:", err);
    }
  };

  const updateQuantity = async (cartItemId, menuId, newQuantity, note) => {
    if (newQuantity < 1) return;

    try {
      const token = getToken();
      if (newQuantity > 0) {
        const updatedCartItem = await updateCartItemQuantityService(menuId, newQuantity, token);
        console.log("updateCartItemQuantityService response:", updatedCartItem.data);
        
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.menu_id === menuId 
              ? { 
                  ...item, 
                  total_quantity: newQuantity,
                  ...(updatedCartItem.data?.cartItem || updatedCartItem.data || {})
                }
              : item
          )
        );
      }
    } catch (err) {
      setError("Error updating quantity. Please try again.");
      console.error("Error updating quantity:", err);
    }
  };

  const removeAllItems = async () => {
    try {
      const token = getToken();
      console.log("Removing all items from cart:", cartItems);
      const deletePromises = cartItems.map(
        (item) =>
          console.log("Deleting item:", item) ||
          deleteCartItemService(item.menu_id, item.cart_item_id, token)
      );

      await Promise.all(deletePromises);
      setCartItems([]);
    } catch (err) {
      setError("Error removing all items. Please try again.");
      console.error("Error removing all items:", err);
    }
  };
  const calculateAddOnsPrice = (item) => {
    if (!item.addsOn || !Array.isArray(item.addsOn)) {
      return 0;
    }

    return item.addsOn.reduce((total, addOn) => {
      if (!addOn.items || !Array.isArray(addOn.items)) return total;

      const addOnItemsTotal = addOn.items.reduce((sum, addOnItem) => {
        const price = parseFloat(addOnItem.adds_on_price || 0);
        return sum + price;
      }, 0);

      return total + addOnItemsTotal;
    }, 0);
  };

  const getItemTotalPrice = (item) => {
    const menuPrice = parseFloat(item.menu ? item.menu.menu_price : item.menu_price || 0);
    const addOnsPrice = calculateAddOnsPrice(item);
    return menuPrice + addOnsPrice;
  };

  const calculateTotalItems = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

    const total = cartItems.reduce((total, item) => {
      const itemQuantity = parseInt(item.total_quantity);
      return total + itemQuantity;
    }, 0);
    console.log("Total items:", total);
    return total;
  };

  const totalItems = calculateTotalItems();

  const calculateSubtotal = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

    return cartItems.reduce((total, item) => {
      const itemTotalPrice = getItemTotalPrice(item);
      const quantity = parseInt(item.total_quantity) || 1;
      return total + (itemTotalPrice * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const handleCheckout = async () => {
    if (!cartId) {
      setError("No cart found for checkout");
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/order/checkout-cart/${cartId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          cartId: cartId,
          restaurantId: restaurantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Checkout failed with status ${response.status}`
        );
      }

      if (data.success) {
        window.location.href = `/orders`;
      } else {
        setError(data.message || "Checkout process failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(`Checkout failed: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
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
            {!restaurantId && (
              <div className="mt-2 font-medium">
                Please select a restaurant first to create a cart.
              </div>
            )}
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
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-yellow-600">Loading cart items...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 overflow-x-hidden min-h-0">
            {cartId && (!Array.isArray(cartItems) || cartItems.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium mb-2">Your cart is empty</p>
                <p className="text-sm">
                  Add items from the menu to get started
                </p>
                {restaurantId && (
                  <button
                    onClick={() =>
                      (window.location.href = `/restaurant/${restaurantId}`)
                    }
                    className="mt-4 px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                  >
                    Browse Menu
                  </button>
                )}
              </div>
            ) : (
              Array.isArray(cartItems) &&
              cartItems.map((item) => (
                <CartItem
                  key={item.cart_item_id}
                  item={item}
                  onUpdateQuantity={(newQuantity) =>{
                    console.log("Updating quantity for item:", item);
                    console.log("New quantity:", newQuantity);
                    updateQuantity(
                      item.cart_item_id,
                      item.menu_id,
                      newQuantity,
                      item.note
                    );
                  }
                  }
                  onRemoveItem={() => removeItem(item.menu_id, item.cart_item_id)}
                  calculateAddOnsPrice={calculateAddOnsPrice}
                  getItemTotalPrice={getItemTotalPrice}
                />
              ))
            )}
          </div>
        )}

        {cartId && Array.isArray(cartItems) && cartItems.length > 0 && (
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
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition hover:cursor-pointer"
                onClick={() => removeAllItems()}
              >
                Empty Cart
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