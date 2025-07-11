/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const ProfilePhoto = ({ preview, handlePhotoChange }) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <label htmlFor="photoUpload" className="cursor-pointer">
        <img
          src={
            preview ||
            "https://cdn-icons-png.flaticon.com/512/9187/9187532.png"
          }
          alt="Profile"
          className="w-24 h-24 object-cover rounded-full mb-4"
        />
      </label>
      <input
        type="file"
        id="photoUpload"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhoto;
