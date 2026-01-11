import { useRef, useEffect, useState } from "react";
import { CiFilter } from "react-icons/ci";

// Separate FilterButton component
const FilterButton = ({ minPrice, setMinPrice, maxPrice, setMaxPrice }) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  // Calculate active filter count
  const activeFilterCount = [minPrice || maxPrice ? 1 : 0].reduce(
    (a, b) => a + b,
    0
  );

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
    setMinPrice("");
    setMaxPrice("");
  };

  // Handle price range input
  const handleMinPriceChange = (e) => setMinPrice(e.target.value);
  const handleMaxPriceChange = (e) => setMaxPrice(e.target.value);

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={toggleFilters}
        className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
          activeFilterCount > 0
            ? "bg-yellow-500 text-white border-yellow-600"
            : "bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-50"
        } transition-colors duration-200 hover:cursor-pointer`}
      >
        <CiFilter />
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
              <h3 className="text-lg font-medium text-yellow-800">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Clear all
              </button>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
