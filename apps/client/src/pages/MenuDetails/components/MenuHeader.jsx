/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const MenuHeader = ({ menu }) => {
  return (
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      {menu.menu_name || "Unnamed Dish"}
    </h1>
  );
};

export default MenuHeader;
