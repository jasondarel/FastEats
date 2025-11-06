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
import useRestaurantData from "./components/useRestaurantData";
import RestaurantHeader from "./components/RestaurantHeader";
import { API_URL } from "../../config/api";

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

  const {
    menuItems,
    error: menuError,
    isLoading: menuLoading,
  } = useMenuData(restaurantId);
  const {
    restaurant,
    averageRating,
    error: restaurantError,
    isLoading: restaurantLoading,
  } = useRestaurantData(restaurantId);

  const getUserIdFromToken = (token) => {
    try {
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

  const createCartService = async (restaurantId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartError("Authentication token not found. Please log in again.");
        setIsCreatingCart(false);
        return null;
      }

      const response = await axios.post(
        `${API_URL}/order/cart`,
        { restaurantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cart created successfully:", response.data);

      const userId = getUserIdFromToken(token);

      localStorage.setItem(
        "activeCart",
        JSON.stringify({
          cartId:
            response.data.cartItem?.cart_id ||
            response.data._id ||
            response.data.id,
          restaurantId: restaurantId,
          userId: userId,
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

  useEffect(() => {
    const handleUserChange = () => {
      const token = localStorage.getItem("token");
      const currentUserId = token ? getUserIdFromToken(token) : null;
      const activeCart = localStorage.getItem("activeCart");

      if (activeCart && currentUserId) {
        try {
          const parsedCart = JSON.parse(activeCart);
          if (parsedCart.userId !== currentUserId) {
            setCartCreated(false);
          }
        } catch (e) {
          console.error("Error parsing activeCart:", e);
        }
      }
    };

    handleUserChange();

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

  const isLoading = menuLoading || restaurantLoading || isCreatingCart;
  const error = menuError || restaurantError;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex ml-0 lg:ml-64 bg-gradient-to-br from-amber-50 via-white to-yellow-50 min-h-screen">
      <Sidebar />
      <BackButton to="/home" />
      <main className="flex-1 relative">
        {/* Restaurant Header */}
        <RestaurantHeader
          restaurant={restaurant}
          averageRating={averageRating}
          menuData={menuItems}
          restaurantId={restaurantId}
        />

        <div className="px-6 md:px-10 lg:px-16 py-8">
          {/* Section Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              Our Menu
            </h1>
            <p className="text-gray-600 text-lg">
              Discover delicious dishes crafted just for you
            </p>
          </div>

          {error && <ErrorMessage message={error} />}
          {cartError && <ErrorMessage message={cartError} />}

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-grow max-w-2xl">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  showUnavailable={showUnavailable}
                  setShowUnavailable={setShowUnavailable}
                  placeholder="Search for your favorite dishes..."
                />
              </div>

              <AlphabetSort
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </div>

            <div className="mt-4">
              <CategoryFilter
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
              />
            </div>
          </div>

          {/* Menu Grid */}
          <MenuItemGrid
            filteredMenu={filteredAndSortedMenu}
            searchQuery={searchQuery}
            filterCategory={filterCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </main>
    </div>
  );
};

export default MenuPage;
