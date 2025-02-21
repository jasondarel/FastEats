import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaMapMarkerAlt, FaPhone, FaLock } from "react-icons/fa";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    profile_photo: "",
    address: "",
    phone_number: "",
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [preview, setPreview] = useState(null);
  const [changePassword, setChangePassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5002/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
        setOriginalProfile(res.data.user); // Simpan data asli
        setPreview(res.data.user.profile_photo || null);
      } catch (error) {
        console.error(error);
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    setIsProfileChanged(
      JSON.stringify(profile) !== JSON.stringify(originalProfile) ||
        preview !== originalProfile.profile_photo
    );
  }, [profile, preview, originalProfile]);

  useEffect(() => {
    setIsPasswordChanged(
      changePassword.currentPassword !== "" ||
        changePassword.newPassword !== "" ||
        changePassword.confirmPassword !== ""
    );
  }, [changePassword]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setChangePassword({ ...changePassword, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5002/profile",
        { ...profile, profile_photo: preview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // alert("Profile updated successfully!");
      Swal.fire({
        title: "Success!",
        text: "Successfully updated profile",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          setOriginalProfile(profile); // Update state original
          setIsProfileChanged(false);
        }
      });
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!isValidPassword(changePassword.newPassword)) {
      alert(
        "Password harus minimal 8 karakter dengan kombinasi huruf dan angka!"
      );
      return;
    }

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5002/change-password", changePassword, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Password updated successfully!");
      setChangePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordChanged(false);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div
      className="flex w-screen min-h-screen bg-yellow-200"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/profilepage.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg mx-auto scale-95 lg:min-w-2xl lg:scale-90 relative">
        <button
          onClick={() => navigate("/home")}
          className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="mt-10 text-2xl lg:text-4xl font-semibold text-center mb-6">
          Edit Profile
        </h2>

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

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
            <FaUser className="ml-3 text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={profile.name}
              onChange={handleChange}
              required
              className="w-full p-3 focus:outline-none"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
            <FaMapMarkerAlt className="ml-3 text-gray-500" />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={profile.address}
              onChange={handleChange}
              required
              className="w-full p-3 focus:outline-none"
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
            <FaPhone className="ml-3 text-gray-500" />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={profile.phone_number}
              onChange={handleChange}
              required
              className="w-full p-3 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!isProfileChanged}
            className={`w-full p-3 rounded-lg transition font-semibold lg:font-bold lg:text-xl ${
              isProfileChanged
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save Profile
          </button>
        </form>

        <h2 className="text-lg font-semibold mt-6">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
            <FaLock className="ml-3 text-gray-500" />
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={changePassword.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full p-3 focus:outline-none"
            />
          </div>

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={changePassword.newPassword}
            onChange={handlePasswordChange}
            required
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={changePassword.confirmPassword}
            onChange={handlePasswordChange}
            required
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            disabled={!isPasswordChanged}
            className={`w-full p-3 rounded-lg transition ${
              isPasswordChanged
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
