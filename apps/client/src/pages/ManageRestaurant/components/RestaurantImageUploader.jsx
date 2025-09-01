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
    <div className="mb-8">
      <label className="block text-gray-700 font-medium mb-3">
        Restaurant Image
      </label>
      <div className="relative group">
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Restaurant"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center">
                <label className="cursor-pointer bg-white/90 backdrop-blur-md text-gray-800 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center border border-white/20">
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
            <label className="cursor-pointer text-gray-500 flex flex-col items-center hover:text-gray-700 transition-colors duration-300">
              <FaImage className="w-12 h-12 mb-2 transition-transform duration-300 hover:scale-110" />
              <span>Click to upload image</span>
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
       <p className="text-sm text-gray-500 mt-2 text-center">
          Recommended: 1200x800px, Max size: 5MB
        </p>
    </div>
    
  );
};

export default RestaurantImageUploader;