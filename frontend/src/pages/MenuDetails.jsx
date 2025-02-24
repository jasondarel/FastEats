import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import axios from "axios";

const MenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 Received menuId:", menuId);
    const fetchMenuDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/restaurant/menu-by-id/${menuId}`,
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

  const handleAddToCart = () => {
    // Implement your cart logic here
    console.log(`Adding ${quantity} ${menu.menu_name} to cart`);
  };

  const handleOrderNow = async() => {
    const token = localStorage.getItem("token");

    console.log(menuId, quantity)
    try {
      const response = await axios.post("http://localhost:5000/order/order", 
        {
          menuId: menuId,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )
      alert("Order placed successfully!");
      window.location.reload();
    } catch(error) {
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

  if (loading)
    return (
      <div className="text-center p-5 text-lg font-semibold text-gray-700">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center p-5 text-lg font-semibold">
        {error}
      </div>
    );
  if (!menu)
    return (
      <div className="text-gray-500 text-center p-5 text-lg font-semibold">
        Menu not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <Link
        to={`/restaurant/${menu.restaurant_id}/menu`}
        className="absolute top-8 right-8 flex items-center justify-center w-12 h-12 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </Link>
      <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-24">
        {menu.menu_name || "Unnamed Dish"}
      </h1>
      <img
        src={
          menu.menu_image ? `http://localhost:5000/restaurant/uploads/menu/${menu.menu_image}` :
          "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
        }
        alt={menu.menu_name || "Menu item"}
        className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
      />
      <p className="text-sm uppercase tracking-wide font-semibold text-gray-600 mb-2">
        {menu.menu_category || "No category"}
      </p>
      <p className="text-2xl font-bold text-yellow-700">
        Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
      </p>
      <p className="mt-3 text-gray-700 leading-relaxed mb-6">
        {menu.menu_description || "No description available."}
      </p>

      {/* Quantity Selector and Order Buttons */}
      <div className="space-y-4">
        {/* Centered Quantity Controls */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              <MinusCircle className="w-6 h-6" />
            </button>
            <span className="text-xl font-semibold min-w-[3ch] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={resetQuantity}
            className="text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-2 text-sm"
            title="Reset quantity to 1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset quantity
          </button>
        </div>

        {/* Order Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white border-2 border-yellow-500 text-yellow-500 px-6 py-3 rounded-lg font-semibold 
                     flex items-center justify-center gap-2 hover:bg-yellow-50
                     transition-colors duration-200 ease-in-out"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          <button
            onClick={handleOrderNow}
            className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold 
                     flex items-center justify-center gap-2 hover:bg-yellow-600
                     transition-colors duration-200 ease-in-out"
          >
            <CreditCard className="w-5 h-5" />
            Order Now - Rp {(menu.menu_price * quantity).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
