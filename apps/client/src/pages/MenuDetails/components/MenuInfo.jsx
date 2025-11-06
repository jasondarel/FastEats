/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const MenuInfo = ({ menu }) => {
  return (
    <div className="space-y-4 pb-6 border-b border-gray-200">
      {/* Price Section */}
      <div className="flex items-baseline gap-3">
        <div className="text-4xl md:text-5xl font-bold bg-amber-500 bg-clip-text text-transparent">
          Rp{" "}
          {menu.menu_price
            ? parseInt(menu.menu_price).toLocaleString("id-ID")
            : "N/A"}
        </div>
        <div className="text-gray-500 text-sm">per item</div>
      </div>

      {/* Description */}
      {menu.menu_description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            About this dish
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {menu.menu_description}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuInfo;
