/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { Camera } from "lucide-react";

const ImageUploader = ({
  imagePreview,
  onImageChange,
  onImageRemove,
  error,
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      onImageChange(file);
    }
  };

  const handleAreaClick = () => {
    document.getElementById("restaurant-image").click();
  };

  return (
    <div>
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-yellow-500 transition-colors cursor-pointer"
        onClick={imagePreview ? null : handleAreaClick}
      >
        <div className="space-y-1 text-center">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Restaurant preview"
                className="mx-auto h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="restaurant-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Upload a photo</span>
                  <input
                    id="restaurant-image"
                    name="restaurant-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploader;
