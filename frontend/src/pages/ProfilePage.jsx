import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState({
    profile_photo: "",
    address: "",
    phone_number: "",
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5002/profile", {
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
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

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
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

        <form onSubmit={handleSave} className="space-y-4">
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
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
