import React from "react";
import SearchBar from "../../../components/SearchBar";

const SearchSection = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory=""
        setFilterCategory={() => {}}
        minPrice=""
        setMinPrice={() => {}}
        maxPrice=""
        setMaxPrice={() => {}}
        showFilterButton={false}
        placeholder="Search restaurants..."
      />
    </div>
  );
};

export default SearchSection;
