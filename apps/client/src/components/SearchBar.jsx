import { useState } from "react";
import FilterButton from "./FilterButton"; // Import the separated FilterButton component
import { CiSearch } from "react-icons/ci";

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  showUnavailable = false,
  setShowUnavailable = null,
  showFilterButton = true,
  placeholder = "Search menu...",
}) => {
  // Handle search input
  const handleSearch = (e) => setSearchQuery(e.target.value);

  return (
    <div
      className={`flex items-center justify-center w-full ${
        showFilterButton ? "gap-4" : ""
      }`}
    >
      {/* Search Bar */}
      <div
        className={`relative ${
          showFilterButton ? "flex-grow min-w-lg" : "w-full max-w-lg"
        }`}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 pl-10 border border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CiSearch />
        </div>
      </div>

      {/* Include FilterButton only if showFilterButton is true */}
      {showFilterButton && (
        <div className="flex items-center space-x-2">
          <FilterButton
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            showUnavailable={showUnavailable}
            setShowUnavailable={setShowUnavailable}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
