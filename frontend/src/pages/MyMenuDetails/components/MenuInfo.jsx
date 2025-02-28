import React from "react";

const MenuInfo = ({ menu }) => {
  return (
    <>
      <div className="bg-yellow-50 p-4 rounded-md mb-4">
        <p className="text-sm uppercase tracking-wide font-semibold text-yellow-800 mb-2">
          Category: {menu.menu_category || "No category"}
        </p>
        <p className="text-2xl font-bold text-yellow-700">
          Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
        </p>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Description
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {menu.menu_description || "No description available."}
        </p>
      </div>
    </>
  );
};

export default MenuInfo;
