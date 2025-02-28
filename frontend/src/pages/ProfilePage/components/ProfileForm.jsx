import React from "react";
import { FaUser, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { saveProfileService } from "../../../../service/userServices/profileService";
import Swal from "sweetalert2";

const ProfileForm = ({
  profile,
  handleChange,
  isProfileChanged,
  preview,
  updateOriginalProfile,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await saveProfileService(profile, preview, token);

      Swal.fire({
        title: "Success!",
        text: "Successfully updated profile",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          updateOriginalProfile();
        }
      });
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        icon={<FaUser className="ml-3 text-gray-500" />}
        type="text"
        name="name"
        placeholder="Name"
        value={profile.name}
        onChange={handleChange}
      />

      <InputField
        icon={<FaMapMarkerAlt className="ml-3 text-gray-500" />}
        type="text"
        name="address"
        placeholder="Address"
        value={profile.address}
        onChange={handleChange}
      />

      <InputField
        icon={<FaPhone className="ml-3 text-gray-500" />}
        type="text"
        name="phone_number"
        placeholder="Phone Number"
        value={profile.phone_number}
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={!isProfileChanged}
        className={`w-full p-3 rounded-lg transition font-semibold lg:font-bold lg:text-xl ${
          isProfileChanged
            ? "bg-yellow-500 text-white hover:bg-yellow-600 hover:cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Save Profile
      </button>
    </form>
  );
};

const InputField = ({ icon, type, name, placeholder, value, onChange }) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
      {icon}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 focus:outline-none"
      />
    </div>
  );
};

export default ProfileForm;
