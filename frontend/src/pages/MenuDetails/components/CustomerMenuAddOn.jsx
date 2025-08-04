import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, AlertCircle, Square, CheckSquare } from 'lucide-react';

const CustomerMenuAddOns = ({ menu, onAddOnsChange }) => {
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [totalAddOnPrice, setTotalAddOnPrice] = useState(0);

  useEffect(() => {
    if (menu?.addsOnCategories) {
      const initialSelections = {};
      menu.addsOnCategories.forEach(category => {
        initialSelections[category.category_id] = category.is_multiple ? [] : null;
      });
      setSelectedAddOns(initialSelections);
    }
  }, [menu]);

  useEffect(() => {
    let total = 0;
    if (menu?.addsOnCategories) {
      menu.addsOnCategories.forEach(category => {
        const selections = selectedAddOns[category.category_id];
        if (selections) {
          if (Array.isArray(selections)) {
            selections.forEach(itemId => {
              const item = category.addsOnItems?.find(item => item.item_id === itemId);
              if (item) {
                total += parseFloat(item.adds_on_price || 0);
              }
            });
          } else {
            const item = category.addsOnItems?.find(item => item.item_id === selections);
            if (item) {
              total += parseFloat(item.adds_on_price || 0);
            }
          }
        }
      });
    }
    setTotalAddOnPrice(total);
    
    if (onAddOnsChange) {
      onAddOnsChange(selectedAddOns, total);
    }
  }, [selectedAddOns, menu, onAddOnsChange]);

  const handleSingleSelection = (categoryId, itemId) => {
    setSelectedAddOns(prev => {
      const currentSelection = prev[categoryId];
      if (currentSelection === itemId) {
        return {
          ...prev,
          [categoryId]: null
        };
      } else {
        return {
          ...prev,
          [categoryId]: itemId
        };
      }
    });
  };

  const handleMultipleSelection = (categoryId, itemId) => {
    setSelectedAddOns(prev => {
      const currentSelections = prev[categoryId] || [];
      const isSelected = currentSelections.includes(itemId);
      
      if (isSelected) {
        return {
          ...prev,
          [categoryId]: currentSelections.filter(id => id !== itemId)
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...currentSelections, itemId]
        };
      }
    });
  };

  const isSelectionValid = (category) => {
    const selections = selectedAddOns[category.category_id];
    const selectionCount = Array.isArray(selections) ? selections.length : (selections ? 1 : 0);
    
    if (category.is_required && selectionCount === 0) {
      return false;
    }
    
    if (category.min_selectable && selectionCount < category.min_selectable) {
      return false;
    }
    
    if (category.max_selectable && selectionCount > category.max_selectable) {
      return false;
    }
    
    return true;
  };

  const getSelectionStatus = (category) => {
    const selections = selectedAddOns[category.category_id];
    const selectionCount = Array.isArray(selections) ? selections.length : (selections ? 1 : 0);
    
    if (category.is_required && selectionCount === 0) {
      return { valid: false, message: 'Required - Please select at least one option' };
    }
    
    if (category.min_selectable && selectionCount < category.min_selectable) {
      return { 
        valid: false, 
        message: `Please select at least ${category.min_selectable} option${category.min_selectable > 1 ? 's' : ''}` 
      };
    }
    
    if (category.max_selectable && selectionCount > category.max_selectable) {
      return { 
        valid: false, 
        message: `Please select no more than ${category.max_selectable} option${category.max_selectable > 1 ? 's' : ''}` 
      };
    }
    
    return { valid: true, message: '' };
  };

  if (!menu?.addsOnCategories || menu.addsOnCategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Customize Your Order</h3>
              <p className="text-sm text-gray-600">Make it exactly how you like it</p>
            </div>
          </div>
          {totalAddOnPrice > 0 && (
            <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl shadow-sm">
              <Plus className="w-4 h-4" />
              <span className="font-semibold">
                Rp {totalAddOnPrice.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6 mt-6">
        {menu.addsOnCategories.map((category) => {
          const status = getSelectionStatus(category);
          const selections = selectedAddOns[category.category_id];
          const selectionCount = Array.isArray(selections) ? selections.length : (selections ? 1 : 0);
          
          return (
            <div key={category.category_id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-amber-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      {category.category_name}
                      {category.is_required && (
                        <span className="text-amber-200 text-lg">*</span>
                      )}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.is_required && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        Required
                      </span>
                    )}
                    {(category.is_multiple || category.max_selectable > 1) && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        Multiple
                      </span>
                    )}
                  </div>
                </div>
                
                {category.category_description && (
                  <p className="text-amber-100 text-sm mt-2">
                    {category.category_description}
                  </p>
                )}
                
                <div className="mt-3">
                  {category.min_selectable && category.max_selectable ? (
                    <p className="text-amber-100 text-sm flex items-center gap-2">
                      <span>Select {category.min_selectable} to {category.max_selectable} items</span>
                      {selectionCount > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                          {selectionCount} selected
                        </span>
                      )}
                    </p>
                  ) : category.max_selectable ? (
                    <p className="text-amber-100 text-sm flex items-center gap-2">
                      <span>Select up to {category.max_selectable} items</span>
                      {selectionCount > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                          {selectionCount} selected
                        </span>
                      )}
                    </p>
                  ) : (category.is_multiple || category.max_selectable > 1) ? (
                    <p className="text-amber-100 text-sm flex items-center gap-2">
                      <span>Select multiple items</span>
                      {selectionCount > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                          {selectionCount} selected
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-amber-100 text-sm">Select one option</p>
                  )}
                </div>
              </div>

              <div className="p-6">
                {!status.valid && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}

                {category.addsOnItems && category.addsOnItems.length > 0 ? (
                  <div className="space-y-3">
                    {category.addsOnItems.map((item) => {
                      const isMultipleCategory = category.is_multiple || category.max_selectable > 1;
                      const isSelected = isMultipleCategory
                        ? (selectedAddOns[category.category_id] || []).includes(item.item_id)
                        : selectedAddOns[category.category_id] === item.item_id;
                      
                      const isDisabled = category.max_selectable && 
                        Array.isArray(selectedAddOns[category.category_id]) &&
                        selectedAddOns[category.category_id].length >= category.max_selectable && 
                        !isSelected;

                      return (
                        <label 
                          key={item.item_id} 
                          className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-200' 
                              : isDisabled
                              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                              : 'bg-white border-gray-200 hover:bg-amber-50 hover:border-amber-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative">
                              <input
                                type="checkbox"
                                name={`category-${category.category_id}`}
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => {
                                  if (!isDisabled) {
                                    if (isMultipleCategory) {
                                      handleMultipleSelection(category.category_id, item.item_id);
                                    } else {
                                      handleSingleSelection(category.category_id, item.item_id);
                                    }
                                  }
                                }}
                                className="sr-only"
                              />
                              
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-amber-500 border-amber-500' 
                                  : isDisabled
                                  ? 'bg-gray-200 border-gray-300'
                                  : 'bg-white border-gray-300 hover:border-amber-400'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <span className={`font-semibold text-base ${
                                isDisabled ? 'text-gray-400' : isSelected ? 'text-amber-800' : 'text-gray-800'
                              }`}>
                                {item.adds_on_name}
                              </span>
                              {item.adds_on_description && (
                                <p className={`text-sm mt-1 ${
                                  isDisabled ? 'text-gray-400' : isSelected ? 'text-amber-600' : 'text-gray-600'
                                }`}>
                                  {item.adds_on_description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <div className={`text-right ${
                              isDisabled ? 'text-gray-400' : isSelected ? 'text-amber-600' : 'text-gray-700'
                            }`}>
                              {parseFloat(item.adds_on_price) > 0 ? (
                                <div className="flex items-center gap-1">
                                  <Plus className="w-3 h-3" />
                                  <span className="font-bold text-lg">
                                    Rp {parseFloat(item.adds_on_price).toLocaleString('id-ID')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full text-sm">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>

                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Minus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      No options available in this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalAddOnPrice > 0 && (
        <div className="mt-6 bg-amber-500 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold">Add-ons Total</span>
                <p className="text-amber-100 text-sm">Extra charges for customizations</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">
                +Rp {totalAddOnPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenuAddOns;