/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const ImageUploader = ({ previewImage, onImageChange }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    onImageChange(file);
  };

  return (
    <div className="mb-4">
      <label className="font-semibold text-sm">
        Update Image<span className="text-pink-600">*</span>
      </label>
      <div className="border border-slate-400 rounded-md border-dashed mt-1 w-full min-h-50 flex flex-col items-center justify-center">
        <p className="font-semibold text-slate-600 text-center my-2">
          JPG, PNG, GIF, WEBP, Max 100mb.
        </p>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="bg-yellow-500 text-white p-2 cursor-pointer hover:bg-yellow-600 rounded-sm font-semibold"
        >
          Choose File
        </label>
        {previewImage && (
          <div className="mt-2 flex justify-center w-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-80 object-contain rounded-md"
              style={{ minWidth: "100%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
