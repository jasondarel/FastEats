import React, { useState } from "react";

const ImageUploader = ({ onImageChange }) => {
  const [previewImage, setPreviewImage] = useState(null);

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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass the file to parent component
      onImageChange(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="font-semibold text-sm transition">
        Upload Image<span className="text-pink-600">*</span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="block border border-dashed border-slate-400 rounded-md mt-1 w-full min-h-50 flex flex-col items-center justify-center 
        hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-300 
        cursor-pointer group"
      >
        <p className="font-semibold text-slate-600 text-center my-2 group-hover:text-yellow-700">
          JPG, PNG, GIF, WEBP, Max 100mb.
        </p>
        <div className=" text-gray-500 p-2 cursor-pointer rounded-sm font-semibold mb-2 group-hover:text-yellow-500">
          Choose File
        </div>
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
      </label>
    </div>
  );
};

export default ImageUploader;
