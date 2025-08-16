/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import CategorySelector from "./CategorySelector";

const CreateMenuForm = ({ onClose, onSubmit }) => {
  
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuImage, setMenuImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [toppingCategories, setToppingCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryMaxSelectable, setNewCategoryMaxSelectable] = useState("1");
  const [selectedToppingCategory, setSelectedToppingCategory] = useState(null);
  const [newToppingName, setNewToppingName] = useState("");
  const [newToppingPrice, setNewToppingPrice] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && newCategoryMaxSelectable) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        maxSelectable: parseInt(newCategoryMaxSelectable),
        adds: []
      };
      setToppingCategories([...toppingCategories, newCategory]);
      setNewCategoryName("");
      setNewCategoryMaxSelectable("1");
    }
  };

  const handleUpdateCategoryMaxSelectable = (categoryId, newMaxSelectable) => {
    setToppingCategories(categories =>
      categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, maxSelectable: parseInt(newMaxSelectable) }
          : cat
      )
    );
  };

  const handleRemoveCategory = (categoryId) => {
    setToppingCategories(toppingCategories.filter(cat => cat.id !== categoryId));
    if (selectedToppingCategory === categoryId) {
      setSelectedToppingCategory(null);
    }
  };

  const handleAddTopping = () => {
    if (newToppingName.trim() && newToppingPrice && selectedToppingCategory) {
      const newTopping = {
        id: Date.now(),
        adds_on_name: newToppingName.trim(),
        adds_on_price: parseFloat(newToppingPrice),
      };
      
      setToppingCategories(categories => 
        categories.map(cat => 
          cat.id === selectedToppingCategory 
            ? { ...cat, adds: [...cat.adds, newTopping] }
            : cat
        )
      );
      
      setNewToppingName("");
      setNewToppingPrice("");
    }
  };

  const handleRemoveTopping = (categoryId, toppingId) => {
    setToppingCategories(categories =>
      categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, adds: cat.adds.filter(topping => topping.id !== toppingId) }
          : cat
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("menuName", menuName);
    formData.append("menuDescription", menuDesc);
    formData.append("menuCategory", selectedCategory);
    formData.append("menuPrice", menuPrice);
    if (menuImage) {
      formData.append("menuImage", menuImage);
    }
    
    formData.append("toppingCategories", JSON.stringify(toppingCategories));

    onSubmit(formData);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))",
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden transition-all duration-300 ${
          isVisible
            ? "transform scale-100 translate-y-0"
            : "transform scale-95 translate-y-10"
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-4 px-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-white drop-shadow-sm">
            Create Menu Item
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-yellow-100 bg-yellow-600 rounded-full p-1 hover:bg-yellow-700 transition-colors transform hover:scale-110 hover:rotate-90 duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 transition-all hover:shadow-md duration-300">
              <ImageUploader onImageChange={(file) => setMenuImage(file)} />
            </div>

            <div className="transition-all duration-200 transform">
              <label className="block font-semibold text-gray-700 mb-2 text-sm">
                Menu Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                placeholder="Enter menu item name"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                required
              />
            </div>

            <div className="transition-all duration-200 transform">
              <label className="block font-semibold text-gray-700 mb-2 text-sm">
                Description<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                placeholder="Enter menu item description"
                value={menuDesc}
                onChange={(e) => setMenuDesc(e.target.value)}
                required
              />
            </div>

            <div className="transition-all duration-200 transform ">
              <label className="block font-semibold text-gray-700 mb-2 text-sm">
                Price (Rp)<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                  placeholder="0"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-all duration-200 hover:shadow-md">
              <h3 className="block font-semibold text-gray-700 mb-2 text-sm">
                Category<span className="text-red-500 ml-1">*</span>
              </h3>
              <CategorySelector
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 transition-all duration-200 hover:shadow-md">
              <h3 className="block font-semibold text-gray-700 mb-4 text-sm">
                Add-ons
                <span className="text-gray-500 text-xs font-normal ml-2">(Optional)</span>
              </h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">1. Create adds-on Category</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    placeholder="Category name (e.g., Cheese Options, Sauce Options)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Max select:</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                      value={newCategoryMaxSelectable}
                      onChange={(e) => setNewCategoryMaxSelectable(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 ${
                      newCategoryName.trim() && newCategoryMaxSelectable
                        ? "bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!newCategoryName.trim() || !newCategoryMaxSelectable}
                  >
                    Add Category
                  </button>
                </div>
              </div>

              {toppingCategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">2. Add adds-on to Category</h4>
                  <div className="flex gap-3">
                    <select
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                      value={selectedToppingCategory || ""}
                      onChange={(e) => setSelectedToppingCategory(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Select category...</option>
                      {toppingCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.adds.length}) - Max: {category.max_selectable}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm disabled:bg-gray-100"
                      placeholder="Adds-on name (e.g., Extra Cheese)"
                      value={newToppingName}
                      onChange={(e) => setNewToppingName(e.target.value)}
                      disabled={!selectedToppingCategory}
                    />
                    <div className="relative w-32">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 text-sm">
                        Rp
                      </span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm disabled:bg-gray-100"
                        placeholder="0"
                        value={newToppingPrice}
                        onChange={(e) => setNewToppingPrice(e.target.value)}
                        disabled={!selectedToppingCategory}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTopping}
                      className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 ${
                        newToppingName.trim() && newToppingPrice && selectedToppingCategory
                          ? "bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      disabled={!newToppingName.trim() || !newToppingPrice || !selectedToppingCategory}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {toppingCategories.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-600">Category Settings & Added adds:</h4>
                  {toppingCategories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <h5 className="font-medium text-gray-800 text-sm">{category.name}</h5>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Max select:</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                              value={category.maxSelectable}
                              onChange={(e) => handleUpdateCategoryMaxSelectable(category.id, e.target.value)}
                            />
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {category.adds.length} items
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Remove category"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      
                      {category.adds.length > 0 ? (
                        <div className="space-y-2">
                          {category.adds.map((topping) => (
                            <div
                              key={topping.id}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-gray-800 text-sm">{topping.adds_on_name}</span>
                                <span className="text-yellow-600 font-semibold ml-2 text-sm">
                                  +Rp {topping.adds_on_price.toLocaleString()}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTopping(category.id, topping.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                title="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-2 border border-dashed border-gray-200 rounded">
                          No items added to this category yet
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {toppingCategories.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  No topping categories created yet. Start by creating a topping category!
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium transition-all duration-300 shadow-sm hover:bg-gray-300 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg bg-yellow-500 text-white font-medium transition-all duration-300 shadow-sm ${
                  !menuName || !menuDesc || !menuPrice || !selectedCategory
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-600 transform hover:-translate-y-1 hover:shadow-md"
                }`}
                disabled={
                  !menuName || !menuDesc || !menuPrice || !selectedCategory
                }
              >
                Create Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuForm;