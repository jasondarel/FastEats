import React, { useState, useRef, useEffect } from "react";
import { FaSort, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

/**
 * Reusable sort button component with dropdown
 * @param {Object} props - Component props
 * @param {string} props.sortBy - Current sort field
 * @param {string} props.sortOrder - Current sort direction ('asc' or 'desc')
 * @param {Function} props.onSortChange - Callback when sort options change
 * @param {Array} props.options - Array of sorting options to display
 * @param {string} props.buttonClassName - Optional additional class for the button
 */
const SortButton = ({
  sortBy,
  sortOrder,
  onSortChange,
  options = [],
  buttonClassName = "",
}) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortRef = useRef(null);

  // Calculate active sort (if not using default)
  const isDefaultSort =
    sortBy === options[0]?.options[0]?.field &&
    sortOrder === options[0]?.options[0]?.direction;
  const activeSortCount = isDefaultSort ? 0 : 1;

  // Handle click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle sort dropdown
  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  // Apply sort options
  const applySortOption = (field, direction) => {
    onSortChange(field, direction);
    setShowSortOptions(false);
  };

  // Generate the button text based on current sort options
  const getSortButtonText = () => {
    // Find the current option from the provided options
    for (const category of options) {
      for (const option of category.options) {
        if (option.field === sortBy && option.direction === sortOrder) {
          return `Sort: ${option.label}`;
        }
      }
    }
    return "Sort";
  };

  return (
    <div className="relative" ref={sortRef}>
      <button
        onClick={toggleSortOptions}
        className={`flex items-center gap-2 px-4 py-2 rounded-md border bg-yellow-500 text-white border-yellow-600 transition-colors duration-200 hover:cursor-pointer hover:bg-yellow-600 ${buttonClassName}`}
      >
        <FaSort className="w-5 h-5" />
        {getSortButtonText()}
        {activeSortCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-yellow-600 rounded-full">
            {activeSortCount}
          </span>
        )}
      </button>

      {/* Sort Dropdown */}
      {showSortOptions && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-yellow-200 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Sort Options
              </h3>
            </div>

            {options.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className={categoryIndex > 0 ? "mt-3" : ""}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {category.label}
                </h4>
                <div className="space-y-2">
                  {category.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() =>
                        applySortOption(option.field, option.direction)
                      }
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        sortBy === option.field &&
                        sortOrder === option.direction
                          ? "bg-yellow-100 text-yellow-800"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        {option.direction === "asc" ? (
                          <FaSortAmountDown className="mr-2" />
                        ) : (
                          <FaSortAmountUp className="mr-2" />
                        )}
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortButton;
