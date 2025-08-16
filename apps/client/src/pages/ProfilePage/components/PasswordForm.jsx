/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { changePasswordService } from "../../../service/userServices/profileService";
import Swal from "sweetalert2";

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
      Swal.fire({
        title: "Invalid Password",
        text: "Password harus minimal 8 karakter dengan kombinasi huruf dan angka!",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      Swal.fire({
        title: "Password Mismatch",
        text: "New passwords do not match!",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await changePasswordService(changePassword, token);
      
      Swal.fire({
        title: "Success!",
        text: "Password updated successfully!",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });
      
      setChangePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordChanged(false);
    } catch (error) {
      let errorMessages = [];
      
      if (error.response?.data?.errors) {
        if (typeof error.response.data.errors === 'object' && !Array.isArray(error.response.data.errors)) {
          Object.values(error.response.data.errors).forEach(errArray => {
            if (Array.isArray(errArray)) {
              errorMessages = [...errorMessages, ...errArray];
            } else if (typeof errArray === 'string') {
              errorMessages.push(errArray);
            }
          });
        } else if (Array.isArray(error.response.data.errors)) {
          errorMessages = error.response.data.errors;
        } else if (typeof error.response.data.errors === 'string') {
          errorMessages = [error.response.data.errors];
        }
      }
      
      if (errorMessages.length === 0) {
        errorMessages = ["Failed to update password"];
      }
      
      const htmlContent = `
        <div class="text-left">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${errorMessages.map(msg => `
              <li style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                <div style="min-width: 24px; height: 24px; border-radius: 50%; background-color: #ef4444; margin-right: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold;">!</div>
                <span>${msg}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
      
      Swal.fire({
        title: "Error",
        html: htmlContent,
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });      
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
        className={`w-full p-3 rounded-lg transition font-semibold ${
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