/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// components/MenuItemGrid.jsx
import React from "react";
import { Link } from "react-router-dom";
import MenuItem from "./MenuItem";
import NoResultsMessage from "./NoResultsMessage";

const MenuItemGrid = ({
  filteredMenu,
  searchQuery,
  filterCategory,
  minPrice,
  maxPrice,
}) => {
  if (filteredMenu.length === 0) {
    return (
      <NoResultsMessage
        hasFilters={searchQuery || filterCategory || minPrice || maxPrice}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-12">
      {filteredMenu.map((item) => (
        <Link
          key={item.menu_id}
          to={`/menu-details/${item.menu_id}`}
          className="transform transition-all duration-300"
        >
          <MenuItem item={item} />
        </Link>
      ))}
    </div>
  );
};

export default MenuItemGrid;
