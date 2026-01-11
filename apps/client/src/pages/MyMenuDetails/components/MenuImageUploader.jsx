import React, { useId } from "react";
import { FaImage, FaCamera } from "react-icons/fa";

const MenuImageUploader = ({
  label = "Menu Image",
  imagePreview,
  existingImageUrl,
  existingImageAlt = "Menu image",
  onImageChange,
}) => {
  const inputId = useId();
  const displayedImage = imagePreview || existingImageUrl;
  const altText = imagePreview ? `${existingImageAlt} preview` : existingImageAlt;

  return (
    <div className="mb-8">
      <label className="block text-gray-700 font-medium mb-3">{label}</label>
      <label htmlFor={inputId} className="relative group block cursor-pointer">
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 transition-colors group-hover:border-amber-400">
          {displayedImage ? (
            <>
              <img
                src={displayedImage}
                alt={altText}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md text-gray-800 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-white/20">
                  <FaCamera className="text-amber-600" />
                  <span className="font-medium">Click to change image</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 flex flex-col items-center transition-colors duration-300 group-hover:text-gray-700">
              <FaImage className="w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-110" />
              <span>Click to upload image</span>
            </div>
          )}
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onImageChange}
      />
      <p className="text-sm text-gray-500 mt-2 text-center">
        Recommended: 1200x800px, Max size: 5MB
      </p>
    </div>
  );
};

export default MenuImageUploader;
