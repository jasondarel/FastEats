/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { API_URL } from "../../../config/api";

const EditMenuForm = ({
  showEditForm,
  setShowEditForm,
  formData,
  handleInputChange,
  handleImageChange,
  handleUpdateMenu,
  previewImage,
  menu,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showEditForm) {
      setIsVisible(true);
    }
  }, [showEditForm]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowEditForm(false);
    }, 300);
  };

  if (!showEditForm) return null;

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
        className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden transition-all duration-300 ${
          isVisible
            ? "transform scale-100 translate-y-0"
            : "transform scale-95 translate-y-10"
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-4 px-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-white drop-shadow-sm">
            Edit Menu Item
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

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleUpdateMenu} className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 transition-all hover:shadow-md duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Image
              </label>
              <div className="border-2 border-dashed border-yellow-300 rounded-md p-4 text-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-64 mx-auto mb-2 object-contain"
                  />
                ) : menu.menu_image ? (
                  <img
                    src={`${API_URL}/restaurant/uploads/menu/${menu.menu_image}`}
                    alt={menu.menu_name}
                    className="max-h-64 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="text-gray-400 mb-2">No image</div>
                )}
                <input
                  type="file"
                  id="menuImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="menuImage"
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded cursor-pointer hover:bg-yellow-200 transition-colors duration-200"
                >
                  Choose New Image
                </label>
              </div>
            </div>

            <div className="transition-all duration-200 transform hover:translate-x-1">
              <label className="block font-semibold text-gray-700 mb-2 text-sm">
                Menu Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="menuName"
                value={formData.menuName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                placeholder="Enter menu item name"
              />
            </div>

            <div className="transition-all duration-200 transform hover:translate-x-1">
              <label className="block font-semibold text-gray-700 mb-2 text-sm">
                Description
              </label>
              <textarea
                name="menuDesc"
                value={formData.menuDesc}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md resize-none"
                placeholder="Enter menu item description"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="transition-all duration-200 transform hover:translate-x-1">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  Price (Rp)<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="menuPrice"
                    value={formData.menuPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="transition-all duration-200 transform hover:translate-x-1">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  Category<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="menuCategory"
                  value={formData.menuCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Drink">Drink</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Others">Others</option>
                </select>
              </div>
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
                className="px-6 py-2.5 rounded-lg bg-yellow-500 text-white font-medium transition-all duration-300 shadow-sm hover:bg-yellow-600 transform hover:-translate-y-1 hover:shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuForm;
