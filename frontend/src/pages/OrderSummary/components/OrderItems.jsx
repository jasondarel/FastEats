const OrderItems = ({ menu, order, formatCurrency, API_URL }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-amber-900">
        Order Summary
      </h2>
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-amber-100 mb-4">
        <img
          src={
            menu.menu_image
              ? `${API_URL}/restaurant/uploads/menu/${menu.menu_image}`
              : "/api/placeholder/80/80"
          }
          alt={menu.menu_name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="text-lg font-semibold text-amber-900">
            {menu.menu_name}
          </div>
          <div className="text-sm text-amber-700 mb-2">
            {menu.menu_description}
          </div>
          <div className="text-amber-900 font-semibold">
            {formatCurrency(menu.menu_price)}
          </div>
        </div>
        <div className="bg-amber-100 px-4 py-2 rounded-lg font-semibold text-amber-900">
          x{order.item_quantity}
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
