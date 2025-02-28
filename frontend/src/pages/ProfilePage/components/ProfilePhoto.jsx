import React from "react";

const ProfilePhoto = ({ preview, handlePhotoChange }) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <label htmlFor="photoUpload" className="cursor-pointer">
        <img
          src={
            preview ||
            "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
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
