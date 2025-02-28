import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import BackButton from "../../components/BackButton";
import CategoryFilter from "../../components/CategoryFilter"; // Import the new component
import MenuItemGrid from "./components/MenuItemGrid";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import useMenuData from "./components/useMenuData";

const MenuPage = () => {
  const { restaurantId } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

  const { menuItems, error, isLoading } = useMenuData(restaurantId);

  const filteredMenu = menuItems.filter((item) => {
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
  });

  if (isLoading) {
    return <LoadingIndicator message="Loading menu..." />;
  }

  return (
    <div className="flex ml-0 lg:ml-64 bg-white min-h-screen">
      <Sidebar />
      <BackButton to="/home" />
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && <ErrorMessage message={error} />}

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

        <CategoryFilter
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
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
