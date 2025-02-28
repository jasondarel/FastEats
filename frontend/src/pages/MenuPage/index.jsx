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
import { ArrowDownAZ, ArrowUpZA, ArrowDownUp, ArrowUpDown } from "lucide-react";

const MenuPage = () => {
  const { restaurantId } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [sortOption, setSortOption] = useState("nameAsc"); // Default sort: A to Z

  const { menuItems, error, isLoading } = useMenuData(restaurantId);

  // Function to cycle through sort options
  const handleSortClick = () => {
    switch (sortOption) {
      case "nameAsc": // A to Z
        setSortOption("nameDesc"); // Z to A
        break;
      case "nameDesc": // Z to A
        setSortOption("priceLow"); // Price: Low to High
        break;
      case "priceLow": // Price: Low to High
        setSortOption("priceHigh"); // Price: High to Low
        break;
      case "priceHigh": // Price: High to Low
        setSortOption("nameAsc"); // Back to A to Z
        break;
      default:
        setSortOption("nameAsc");
    }
  };

  // Get the appropriate icon based on current sort option
  const getSortIcon = () => {
    switch (sortOption) {
      case "nameAsc":
        return <ArrowDownAZ size={18} />;
      case "nameDesc":
        return <ArrowUpZA size={18} />;
      case "priceLow":
        return <ArrowDownUp size={18} />;
      case "priceHigh":
        return <ArrowUpDown size={18} />;
      default:
        return <ArrowDownAZ size={18} />;
    }
  };

  // Get label text for the current sort
  const getSortLabel = () => {
    switch (sortOption) {
      case "nameAsc":
        return "A to Z";
      case "nameDesc":
        return "Z to A";
      case "priceLow":
        return "Price: Low to High";
      case "priceHigh":
        return "Price: High to Low";
      default:
        return "A to Z";
    }
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
      switch (sortOption) {
        case "nameAsc":
          return a.menu_name.localeCompare(b.menu_name);
        case "nameDesc":
          return b.menu_name.localeCompare(a.menu_name);
        case "priceLow":
          return parseInt(a.menu_price) - parseInt(b.menu_price);
        case "priceHigh":
          return parseInt(b.menu_price) - parseInt(a.menu_price);
        default:
          return a.menu_name.localeCompare(b.menu_name);
      }
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
            className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
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
