import { useState, useEffect } from "react";
import { getProfileService } from "../../service/userServices/profileService";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";
import BackButton from "../../components/BackButton";
import ProfilePhoto from "./components/ProfilePhoto";
import PaymentForm from "./components/paymentForm";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    profile_photo: "",
    address: "",
    phone_number: "",
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [preview, setPreview] = useState(null);
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getProfileService(token);
        setProfile(res.data.user);
        setOriginalProfile(res.data.user);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const updateOriginalProfile = () => {
    setOriginalProfile(profile);
    setIsProfileChanged(false);
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
      <BackButton to="/home" />
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg mx-auto scale-95 lg:min-w-2xl lg:scale-90 relative">
        <h2 className="mt-10 text-2xl lg:text-4xl font-semibold text-center mb-6">
          Edit Profile
        </h2>

        <ProfilePhoto preview={preview} handlePhotoChange={handlePhotoChange} />

        <ProfileForm
          profile={profile}
          handleChange={handleProfileChange}
          isProfileChanged={isProfileChanged}
          preview={preview}
          updateOriginalProfile={updateOriginalProfile}
        />

        <h2 className="text-lg font-semibold mt-6">Change Password</h2>
        <PasswordForm />
        <h2 className="text-lg font-semibold mt-6">Set Payment Data</h2>
        <PaymentForm />
      </div>
    </div>
  );
};

export default Profile;
