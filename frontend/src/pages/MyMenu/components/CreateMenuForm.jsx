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

  
  useEffect(() => {
    setIsVisible(true);
  }, []);

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
