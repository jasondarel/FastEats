/* eslint-disable react/prop-types */
import React from "react";
import ErrorMessage from "./ErrorMessage";
import { IoCloseOutline } from "react-icons/io5";
import { RiImageAddLine } from "react-icons/ri";

const ImageUploader = ({
  imagePreview,
  onImageChange,
  onImageRemove,
  error,
}) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="mt-1">
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Restaurant Preview"
            className="h-48 w-full max-w-full object-cover rounded-lg shadow"
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
            aria-label="Remove image"
          >
            <IoCloseOutline />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center hover:border-yellow-400 hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <RiImageAddLine className="text-5xl text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-yellow-500 hover:text-yellow-600">
                Upload an image
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
      <ErrorMessage error={error} />
    </div>
  );
};

export default ImageUploader;
