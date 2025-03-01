// components/NoResultsMessage.jsx
import React from "react";

const NoResultsMessage = ({ hasFilters }) => {
  return (
    <div className="text-gray-500 text-center py-8">
      {hasFilters
        ? "No menu items match your search criteria."
        : "No menu available."}
    </div>
  );
};

export default NoResultsMessage;
