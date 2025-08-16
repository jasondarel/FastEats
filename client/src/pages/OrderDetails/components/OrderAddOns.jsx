/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const OrderAddOns = ({ addOns }) => {
  if (!addOns || !Array.isArray(addOns) || addOns.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-amber-50 rounded-lg border border-amber-200">
      <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add-Ons
      </h3>

      <div className="space-y-4">
        {addOns.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
              <div>
                <h4 className="font-medium text-amber-800 capitalize">
                  {category.category_name}
                </h4>
                {category.is_required && (
                  <span className="text-xs text-red-600 font-medium">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {category.items && Array.isArray(category.items) ? (
                category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 bg-amber-25 rounded-lg border border-amber-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div>
                        <span className="text-amber-900 font-medium">
                          {item.adds_on_name || item.addon_name || item.name || 'Add-on Item'}
                        </span>
                        {item.description && (
                          <p className="text-sm text-amber-600 mt-1">
                            {item.description}
                          </p>
                        )}
                       
                      </div>
                    </div>
                    <div className="text-right">
                      {item.adds_on_price && parseFloat(item.adds_on_price) > 0 && (
                        <span className="text-amber-800 font-medium">
                          +Rp {parseFloat(item.adds_on_price).toLocaleString("id-ID")}
                        </span>
                      )}
                      {item.quantity && item.quantity > 1 && (
                        <div className="text-xs text-amber-600 mt-1">
                          Qty: {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-amber-600 text-sm italic">
                  No items selected for this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-amber-200">
        
        
        {(() => {
          let totalAddOnPrice = 0;
          let hasPrice = false;
          
          addOns.forEach(category => {
            if (category.items && Array.isArray(category.items)) {
              category.items.forEach(item => {
                if (item.adds_on_price && parseFloat(item.adds_on_price) > 0) {
                  totalAddOnPrice += parseFloat(item.adds_on_price) * (item.quantity || 1);
                  hasPrice = true;
                }
              });
            }
          });

          return hasPrice ? (
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-amber-700 font-medium">
                Total Add-on Price:
              </span>
              <span className="text-amber-900 font-semibold">
                Rp {totalAddOnPrice.toLocaleString("id-ID")}
              </span>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default OrderAddOns;