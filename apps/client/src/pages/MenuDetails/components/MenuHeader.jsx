/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const MenuHeader = ({ menu }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-amber-600 bg-clip-text text-transparent mb-3">
        {menu.menu_name || "Unnamed Dish"}
      </h1>
      {menu.is_available ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Available Now
        </span>
      ) : (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Currently Unavailable
        </span>
      )}
    </div>
  );
};

export default MenuHeader;
