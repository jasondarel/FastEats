import { useState } from "react";
import FilterButton from "./FilterButton"; // Import the separated FilterButton component

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
    <div className="flex flex-wrap gap-4 items-center justify-center w-fit">
      {/* Search Bar */}
      <div className="relative flex-grow min-w-lg">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 pl-10 border border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-yellow-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>

      {/* Include FilterButton only if showFilterButton is true */}
      {showFilterButton && (
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
      )}
    </div>
  );
};

export default SearchBar;
