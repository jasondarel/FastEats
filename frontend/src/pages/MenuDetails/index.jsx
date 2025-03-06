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
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

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
          window.location.reload();
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
