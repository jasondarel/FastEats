import React from "react";

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
  if (!showEditForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-700">Edit Menu Item</h2>
          <button
            onClick={() => setShowEditForm(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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

        <form onSubmit={handleUpdateMenu}>
          <div className="mb-4">
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
                  src={`http://localhost:5000/restaurant/uploads/menu/${menu.menu_image}`}
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
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded cursor-pointer hover:bg-yellow-200"
              >
                Choose New Image
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="menuName"
              value={formData.menuName}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="menuDesc"
              value={formData.menuDesc}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rp)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="menuPrice"
                value={formData.menuPrice}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                name="menuCategory"
                value={formData.menuCategory}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="Food">Food</option>
                <option value="Drink">Drink</option>
                <option value="Dessert">Dessert</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuForm;
