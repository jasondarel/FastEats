import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { changePasswordService } from "../../../../service/userServices/profileService";

const PasswordForm = () => {
  const [changePassword, setChangePassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  useEffect(() => {
    setIsPasswordChanged(
      changePassword.currentPassword !== "" ||
        changePassword.newPassword !== "" ||
        changePassword.confirmPassword !== ""
    );
  }, [changePassword]);

  const handlePasswordChange = (e) => {
    setChangePassword({ ...changePassword, [e.target.name]: e.target.value });
  };

  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
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
      await changePasswordService(changePassword, token);
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
    <form onSubmit={handleSubmit} className="space-y-3">
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
            ? "bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Change Password
      </button>
    </form>
  );
};

export default PasswordForm;
