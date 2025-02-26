import { useRef, useEffect, useState } from "react";

const validCategories = ["Food", "Drink", "Dessert", "Others"];

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
  placeholder = "Search menu...", // Add default placeholder prop
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  // Calculate active filter count
  const activeFilterCount = [
    filterCategory ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
    showUnavailable ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilterCategory("");
    setMinPrice("");
    setMaxPrice("");
    if (setShowUnavailable) {
      setShowUnavailable(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Handle category filter
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);

  // Handle price range input
  const handleMinPriceChange = (e) => setMinPrice(e.target.value);
  const handleMaxPriceChange = (e) => setMaxPrice(e.target.value);

  // Handle availability toggle
  const handleAvailabilityToggle = (e) => {
    if (setShowUnavailable) {
      setShowUnavailable(e.target.checked);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
      {/* Search Bar */}
      <div className="relative flex-grow max-w-lg">
        <input
          type="text"
          placeholder={placeholder} // Use the custom placeholder
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

      {/* Filter Button and Dropdown - Only show if showFilterButton is true */}
      {showFilterButton && (
        <div className="relative" ref={filterRef}>
          <button
            onClick={toggleFilters}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              activeFilterCount > 0
                ? "bg-yellow-500 text-white border-yellow-600"
                : "bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-50"
            } transition-colors duration-200 hover:cursor-pointer`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-yellow-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-yellow-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-yellow-800">
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    Clear all
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={handleCategoryFilter}
                    className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {validCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Availability Toggle (Only show if setShowUnavailable is provided) */}
                {setShowUnavailable && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={showUnavailable}
                        onChange={handleAvailabilityToggle}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      Show unavailable items
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
