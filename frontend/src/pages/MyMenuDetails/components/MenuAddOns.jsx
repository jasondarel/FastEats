import React from 'react';

const MenuAddOns = ({ menu }) => {
  if (!menu?.addsOnCategories || menu.addsOnCategories.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Add-ons</h3>
        <p className="text-gray-500 text-sm">No add-ons available for this menu item.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Add-ons</h3>
      
      <div className="space-y-4">
        {menu.addsOnCategories.map((category) => (
          <div key={category.category_id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-800">
                {category.category_name}
              </h4>
              <div className="flex items-center gap-2">
                {category.is_required && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Required
                  </span>
                )}
                {category.is_multiple && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Multiple Selection
                  </span>
                )}
              </div>
            </div>

            {category.category_description && (
              <p className="text-gray-600 text-sm mb-3">
                {category.category_description}
              </p>
            )}

            {category.min_selectable && category.max_selectable && (
              <p className="text-gray-500 text-xs mb-3">
                Select {category.min_selectable} to {category.max_selectable} items
              </p>
            )}

            {category.max_selectable && !category.min_selectable && (
              <p className="text-gray-500 text-xs mb-3">
                Select up to {category.max_selectable} items
              </p>
            )}

            {category.addsOnItems && category.addsOnItems.length > 0 ? (
              <div className="space-y-2">
                {category.addsOnItems.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {item.adds_on_name}
                        </span>
                      </div>
                      {item.adds_on_description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {item.adds_on_description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">
                        {parseFloat(item.adds_on_price) > 0 ? (
                          `+Rp ${parseFloat(item.adds_on_price).toLocaleString('id-ID')}`
                        ) : (
                          'Free'
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No items available in this category.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuAddOns;