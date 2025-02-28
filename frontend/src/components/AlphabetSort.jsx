import React from "react";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";

const AlphabetSort = ({ sortOption, setSortOption }) => {
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

  return (
    <button
      onClick={handleSortClick}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 hover:cursor-pointer transition-colors"
    >
      {getSortIcon()}
      <span>{getSortLabel()}</span>
    </button>
  );
};

export default AlphabetSort;
