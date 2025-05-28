/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const MenuInfo = ({ menu }) => {
  return (
    <>
      <p className="text-sm uppercase tracking-wide font-semibold text-gray-600 mb-2">
        {menu.menu_category || "No category"}
      </p>
      <p className="text-2xl font-bold text-yellow-700">
        Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
      </p>
      <p className="mt-3 text-gray-700 leading-relaxed mb-6">
        {menu.menu_description || "No description available."}
      </p>
    </>
  );
};

export default MenuInfo;
