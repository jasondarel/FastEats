import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import BackButton from "../../components/BackButton";
import CategoryFilter from "../../components/CategoryFilter";
import MenuItemGrid from "./components/MenuItemGrid";
import ErrorMessage from "./components/ErrorMessage";
import LoadingState from "../../components/LoadingState";
import AlphabetSort from "../../components/AlphabetSort";
import useMenuData from "./components/useMenuData";

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [sortOption, setSortOption] = useState("nameAsc");
  const [cartCreated, setCartCreated] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [isCreatingCart, setIsCreatingCart] = useState(false);

  const { menuItems, error, isLoading } = useMenuData(restaurantId);

  // Check if cart exists for this restaurant and handle different restaurant scenarios
  const checkExistingCart = () => {
    const activeCart = localStorage.getItem("activeCart");
    // Get current user ID to verify cart ownership
    const token = localStorage.getItem("token");
    const currentUserId = token ? getUserIdFromToken(token) : null;

    if (activeCart && currentUserId) {
      try {
        const parsedCart = JSON.parse(activeCart);

        // Check if cart belongs to current user
        if (parsedCart.userId !== currentUserId) {
          // This cart belongs to a different user, ignore it
          return { exists: false };
        }

        if (parsedCart.restaurantId === restaurantId) {
          // Cart for this restaurant already exists for current user
          setCartCreated(true);
          return { exists: true, sameRestaurant: true };
        } else {
          // Cart exists but for a different restaurant (same user)
          return {
            exists: true,
            sameRestaurant: false,
            cartId: parsedCart.cartId,
          };
        }
      } catch (e) {
        console.error("Error parsing activeCart from localStorage:", e);
      }
    }
    return { exists: false };
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
      // Different JWT implementations use different fields for user ID
      return payload.userId || payload.sub || payload.id || null;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  // Delete existing cart
  const deleteExistingCart = async (cartId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error(
          "Authentication token not found. Cannot delete previous cart."
        );
        return false;
      }

      await axios.delete(`http://localhost:5000/order/cart/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Previous cart deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting previous cart:", error);
      return false;
    }
  };

  const createCartService = async (restaurantId) => {
    // Check if we already have a cart and if it's for the same restaurant
    const cartStatus = checkExistingCart();

    if (cartStatus.exists) {
      if (cartStatus.sameRestaurant) {
        // Cart for this restaurant already exists, no need to create a new one
        return;
      } else {
        // Cart exists but for a different restaurant, delete it first
        setIsCreatingCart(true);
        const deleted = await deleteExistingCart(cartStatus.cartId);
        if (!deleted) {
          setCartError(
            "Failed to delete previous cart. Please try refreshing the page."
          );
          setIsCreatingCart(false);
          return null;
        }
        // Continue to create a new cart below
      }
    } else {
      setIsCreatingCart(true);
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartError("Authentication token not found. Please log in again.");
        setIsCreatingCart(false);
        return null;
      }

      const response = await axios.post(
        `http://localhost:5000/order/cart`,
        { restaurantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cart created successfully:", response.data);

      // Get current user ID
      const userId = getUserIdFromToken(token);

      // Save cart info to localStorage to track active cart
      localStorage.setItem(
        "activeCart",
        JSON.stringify({
          cartId: response.data.cartId || response.data._id || response.data.id,
          restaurantId: restaurantId,
          userId: userId, // Store user ID with cart info
          createdAt: new Date().toISOString(),
        })
      );

      setCartCreated(true);
      setIsCreatingCart(false);
      return response.data;
    } catch (error) {
      console.error("Error creating cart:", error);

      if (error.response && error.response.data) {
        setCartError(
          `Server error: ${error.response.status}. ${
            error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else {
        setCartError(`Error: ${error.message}`);
      }

      setIsCreatingCart(false);
      return null;
    }
  };

  // Reset cart state when user changes
  useEffect(() => {
    const handleUserChange = () => {
      // Check if the active cart belongs to the current user
      const token = localStorage.getItem("token");
      const currentUserId = token ? getUserIdFromToken(token) : null;
      const activeCart = localStorage.getItem("activeCart");

      if (activeCart && currentUserId) {
        try {
          const parsedCart = JSON.parse(activeCart);
          if (parsedCart.userId !== currentUserId) {
            // If cart belongs to different user, reset cart state
            setCartCreated(false);
          }
        } catch (e) {
          console.error("Error parsing activeCart:", e);
        }
      }
    };

    // Run on component mount
    handleUserChange();

    // Listen for login/logout events
    window.addEventListener("storage", (e) => {
      if (e.key === "token") {
        handleUserChange();
      }
    });

    return () => {
      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  useEffect(() => {
    if (restaurantId && !cartCreated) {
      createCartService(restaurantId);
    }
  }, [restaurantId, cartCreated]);

  const filteredAndSortedMenu = menuItems
    .filter((item) => {
      const matchesSearch = item.menu_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || item.menu_category === filterCategory;

      const price = parseInt(item.menu_price);
      let matchesPrice = true;
      if (minPrice && price < parseInt(minPrice)) matchesPrice = false;
      if (maxPrice && price > parseInt(maxPrice)) matchesPrice = false;

      const matchesAvailability = showUnavailable
        ? true
        : item.is_available === true;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesAvailability
      );
    })
    .sort((a, b) => {
      return sortOption === "nameAsc"
        ? a.menu_name.localeCompare(b.menu_name)
        : b.menu_name.localeCompare(a.menu_name);
    });

  if (isLoading || isCreatingCart) {
    return <LoadingState />;
  }

  return (
    <div className="flex ml-0 lg:ml-64 bg-white min-h-screen">
      <Sidebar />
      <BackButton to="/home" />
      <main className="flex-1 p-5 relative mt-20 px-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && <ErrorMessage message={error} />}
        {cartError && <ErrorMessage message={cartError} />}

        <div className="flex flex-wrap gap-4 lg:gap-0 items-center justify-center mb-6">
          <div className="flex-grow max-w-2xl flex justify-center right-0 mr-5">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              showUnavailable={showUnavailable}
              setShowUnavailable={setShowUnavailable}
              placeholder="Search menu items..."
            />
          </div>

          <AlphabetSort sortOption={sortOption} setSortOption={setSortOption} />
        </div>

        <CategoryFilter
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

        <MenuItemGrid
          filteredMenu={filteredAndSortedMenu}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </main>
    </div>
  );
};

export default MenuPage;
