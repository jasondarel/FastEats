import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    profile_photo: "",
    address: "",
    phone_number: "",
  });

  const [preview, setPreview] = useState(null);
  const [changePassword, setChangePassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://9bb6-61-5-30-124.ngrok-free.app/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
        setPreview(res.data.user.profile_photo || null);
      } catch (error) {
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

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
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changePassword.newPassword !== changePassword.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put("https://9bb6-61-5-30-124.ngrok-free.app/change-password", changePassword, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Password updated successfully!");
      setChangePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-30 p-2 bg-white text-yellow-500 rounded-lg hover:text-yellow-600 transition text-5xl hover:cursor-pointer"
      >
        ←
      </button>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Edit Profile
        </h2>

        <div className="flex flex-col items-center mb-4">
          <label htmlFor="photoUpload" className="cursor-pointer">
            <img
              src={preview || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border"
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
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={profile.address}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={profile.phone_number}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Save Profile
          </button>
        </form>

        <h2 className="text-lg font-semibold mt-6">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={changePassword.currentPassword}
            onChange={handlePasswordChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={changePassword.newPassword}
            onChange={handlePasswordChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={changePassword.confirmPassword}
            onChange={handlePasswordChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
