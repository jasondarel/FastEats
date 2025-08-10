/* eslint-disable react/prop-types */
import React from "react";
import ErrorMessage from "./ErrorMessage";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-center hover:border-yellow-400 hover:bg-gray-50 transition-colors"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
