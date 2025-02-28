import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import BackButton from "../../components/BackButton";
import CategoryFilter from "../../components/CategoryFilter";
import MenuItemGrid from "./components/MenuItemGrid";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import useMenuData from "./components/useMenuData";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";

const MenuPage = () => {
  const { restaurantId } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [sortOption, setSortOption] = useState("nameAsc"); // Default sort: A to Z

  const { menuItems, error, isLoading } = useMenuData(restaurantId);

  // Function to toggle between A-Z and Z-A
  const handleSortClick = () => {
    setSortOption(sortOption === "nameAsc" ? "nameDesc" : "nameAsc");
  };

  // Get the appropriate icon based on current sort option
  const getSortIcon = () => {
    return sortOption === "nameAsc" ? (
      <ArrowDownAZ size={18} />
    ) : (
      <ArrowUpZA size={18} />
    );
  };

  // Get label text for the current sort
  const getSortLabel = () => {
    return sortOption === "nameAsc" ? "A to Z" : "Z to A";
  };

  // Apply filters and sorting
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
      // Only sort by name ascending or descending
      return sortOption === "nameAsc"
        ? a.menu_name.localeCompare(b.menu_name)
        : b.menu_name.localeCompare(a.menu_name);
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

        <div className="flex flex-wrap gap-4 items-center mb-6">
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

          <button
            onClick={handleSortClick}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 hover:cursor-pointer transition-colors"
          >
            {getSortIcon()}
            <span>{getSortLabel()}</span>
          </button>
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
