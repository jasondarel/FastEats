import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import MenuHeader from "./components/MenuHeader";
import MenuImage from "./components/MenuImage";
import MenuInfo from "./components/MenuInfo";
import QuantitySelector from "./components/QuantitySelector";
import OrderButtons from "./components/OrderButtons";
import LoadingState from "../../components/LoadingState";
import ErrorState from "./components/ErrorState";
import NotFoundState from "./components/NotFoundState";
import insertOrderService from "../../service/restaurantService/menuDetailsService";
import {
  createCartService,
  createCartItemService,
} from "../../service/orderServices/orderDetails";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_URL } from "../../config/api";

const MenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartId, setCartId] = useState(null);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    console.log("🔍 Received menuId:", menuId);
    const fetchMenuDetails = async () => {
      try {
        const response = await fetch(
          `${API_URL}/restaurant/menu-by-id/${menuId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch menu details");
        }

        const data = await response.json();
        if (!data.menu) {
          throw new Error("Invalid menu data received");
        }
        setMenu(data.menu);
      } catch (error) {
        console.log("Error: ", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Not logged in!",
        text: "Please log in to add items to your cart",
        icon: "warning",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#efb100",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      Swal.fire({
        title: "Adding to cart...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let activeCartId = null;
      const activeCart = localStorage.getItem("activeCart");
      console.log("activeCart from localStorage:", activeCart);
      console.log("activeCartId:", activeCart.cartId);

      if (activeCart) {
        try {
          const parsedCart = JSON.parse(activeCart);
          console.log("parsedCart:", parsedCart);

          const currentUserId = getUserIdFromToken(token);
          console.log("parsedCart.cartId:", parsedCart.cartId);
          if (
            parsedCart.userId === currentUserId &&
            parsedCart.restaurantId.toString() === menu.restaurant_id.toString()
          ) {
            activeCartId = parsedCart.cartId; //ada
          }
        } catch (e) {
          console.error("Error parsing activeCart from localStorage:", e);
        }
      }

      if (!activeCartId) {
        try {
          console.log("Checking for existing carts via API...");
          const cartsResponse = await createCartItemService();
          const userCarts = cartsResponse.data.carts || [];

          const restaurantCart = userCarts.find(
            (cart) => cart.restaurant_id === menu.restaurant_id
          );

          if (restaurantCart) {
            activeCartId = restaurantCart.cart_id;
            console.log("Found existing cart via API:", activeCartId);

            const userId = getUserIdFromToken(token);
            localStorage.setItem(
              "activeCart",
              JSON.stringify({
                cartId: activeCartId,
                restaurantId: menu.restaurant_id,
                userId: userId,
                createdAt: new Date().toISOString(),
              })
            );
          }
        } catch (error) {
          console.log("Error fetching carts:", error);
        }
      }

      if (!activeCartId) {
        console.log("No existing cart found, creating new cart...");
        const createResponse = await createCartService(
          menu.restaurant_id,
          token
        );
        activeCartId = createResponse.data.cartItem.cart_id;
        console.log("active cart created:", activeCartId);

        const userId = getUserIdFromToken(token);
        localStorage.setItem(
          "activeCart",
          JSON.stringify({
            cartId: activeCartId,
            restaurantId: menu.restaurant_id,
            userId: userId,
            createdAt: new Date().toISOString(),
          })
        );
      }

      await createCartItemService(activeCartId, menuId, quantity, "", token);
      console.log("Item being added to cart :", activeCartId, menuId, quantity);
      Swal.close();
      Swal.fire({
        title: "Added to cart!",
        text: `${quantity} ${menu.menu_name} added to your cart`,
        icon: "success",
        confirmButtonText: "View Cart",
        confirmButtonColor: "#efb100",
        showCancelButton: true,
        cancelButtonText: "Continue Shopping",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.close();
      let errorMessage = "Failed to add item to cart";
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 2000);
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (status === 400) {
          errorMessage =
            "Please check your input. Some required information is missing.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to add items to cart.";
        } else if (status === 404) {
          errorMessage = "The restaurant or menu item could not be found.";
        }
      }
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });
    }
  };

  // Helper function to extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    try {
      // Simple JWT parsing (assumes token has 3 parts separated by dots)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.sub || payload.id || null;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  const handleOrderNow = async () => {
    const token = localStorage.getItem("token");

    console.log(menuId, quantity);
    try {
      const response = await insertOrderService(menuId, quantity, token);

      Swal.fire({
        title: "Success!",
        text: "Order placed successfully!",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/orders");
        }
      });
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        console.error("Error response:", data);
        if (status === 400) {
          if (data.errors) {
            const validationErrors = Object.values(data.errors)
              .map((msg) => `• ${msg}`)
              .join("\n");
            alert(`Validation Error:\n${validationErrors}`);
          } else if (data.message) {
            alert(`Error: ${data.message}`);
          } else {
            alert("Invalid request. Please check your input.");
          }
        } else if (status === 401) {
          alert("Unauthorized! Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(
            data.message ||
              "An unexpected error occurred. Please try again later."
          );
        }
      }
    }
  };

  const resetQuantity = () => {
    setQuantity(1);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!menu) return <NotFoundState message="Menu not found." />;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-3xl mx-auto p-6 bg-white shadow-lg shadow-slate-300 inset-shadow-xs inset-shadow-slate-300 rounded-xl">
        <BackButton to={`/restaurant/${menu.restaurant_id}/menu`} />
        <MenuHeader menu={menu} />
        <MenuImage menu={menu} />
        <MenuInfo menu={menu} />

        <div className="space-y-4">
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onReset={resetQuantity}
          />
          <OrderButtons
            menu={menu}
            quantity={quantity}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
