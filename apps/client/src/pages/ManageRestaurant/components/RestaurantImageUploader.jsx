/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaImage, FaCamera } from "react-icons/fa";

const RestaurantImageUploader = ({ imagePreview, onImageChange }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      onImageChange(file);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          <div className="w-full h-72 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 shadow-sm">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Restaurant"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <label className="cursor-pointer bg-white/95 backdrop-blur-md text-gray-800 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center border border-amber-200">
                    <FaCamera className="mr-2 text-amber-600" />
                    Change Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="cursor-pointer text-gray-500 flex flex-col items-center hover:text-amber-600 transition-colors duration-300">
                <FaImage className="w-16 h-16 mb-3 transition-transform duration-300 hover:scale-110" />
                <span className="text-lg font-medium">Click to upload image</span>
                <span className="text-sm text-gray-400 mt-1">Drag & drop also supported</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3 text-center">
          Recommended: 1200x800px • Max size: 5MB • JPG, PNG, or WEBP
        </p>
      </div>
    </div>
  );
};

export default RestaurantImageUploader;