// MenuPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import BackButton from "../../components/BackButton";
import MenuItemGrid from "./components/MenuItemGrid";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import useMenuData from "./components/useMenuData";

const MenuPage = () => {
  const { restaurantId } = useParams();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Custom hook to handle data fetching and state
  const { menuItems, error, isLoading } = useMenuData(restaurantId);

  // Filter logic
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.menu_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory
      ? item.menu_category === filterCategory
      : true;

    const price = parseInt(item.menu_price);
    let matchesPrice = true;
    if (minPrice && price < parseInt(minPrice)) matchesPrice = false;
    if (maxPrice && price > parseInt(maxPrice)) matchesPrice = false;

    // Only show available items unless showUnavailable is toggled on
    const matchesAvailability = showUnavailable
      ? true
      : item.is_available === true;

    return (
      matchesSearch && matchesCategory && matchesPrice && matchesAvailability
    );
  });

  if (isLoading) {
    return <LoadingIndicator message="Loading menu..." />;
  }

  return (
    <div className="flex ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <BackButton to="/home" />
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && <ErrorMessage message={error} />}

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          showUnavailable={showUnavailable}
          setShowUnavailable={setShowUnavailable}
          placeholder="Search menu items..."
        />

        <MenuItemGrid
          filteredMenu={filteredMenu}
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
