import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaSave,
  FaImage,
  FaCamera,
  FaDoorOpen,
  FaDoorClosed,
} from "react-icons/fa";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ManageRestaurant = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [initialRestaurantName, setInitialRestaurantName] = useState("");
  const [initialRestaurantAddress, setInitialRestaurantAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [initialIsOpen, setInitialIsOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRestaurantData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/restaurant/restaurant",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const { restaurant } = response.data;
        if (restaurant) {
          setRestaurantName(restaurant.restaurant_name);
          setRestaurantAddress(restaurant.restaurant_address);
          setInitialRestaurantName(restaurant.restaurant_name);
          setInitialRestaurantAddress(restaurant.restaurant_address);
          setIsOpen(restaurant.is_open || false);
          setInitialIsOpen(restaurant.is_open || false);

          const imageUrl = restaurant.restaurant_image
            ? `http://localhost:5000/restaurant/uploads/${restaurant.restaurant_image}`
            : null;
          setImagePreview(imageUrl);
        } else {
          alert("Restaurant data not found.");
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while fetching the restaurant details.");
      }
    };

    fetchRestaurantData();
  }, [navigate]);

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

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsChanged(true);
    }
  };

  useEffect(() => {
    if (
      restaurantName !== initialRestaurantName ||
      restaurantAddress !== initialRestaurantAddress ||
      isOpen !== initialIsOpen ||
      imageFile
    ) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [
    restaurantName,
    restaurantAddress,
    initialRestaurantName,
    initialRestaurantAddress,
    isOpen,
    initialIsOpen,
    imageFile,
  ]);

  const handleToggleOpenStatus = () => {
    setIsOpen(!isOpen);
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    if (!isChanged) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("restaurantName", restaurantName);
      formData.append("restaurantAddress", restaurantAddress);
      formData.append("isOpen", isOpen);
      if (imageFile) {
        formData.append("restaurantImage", imageFile);
      }

      const response = await axios.put(
        "http://localhost:5000/restaurant/restaurant",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Successfully updated the restaurant",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
      setInitialRestaurantName(restaurantName);
      setInitialRestaurantAddress(restaurantAddress);
      setInitialIsOpen(isOpen);
      setImageFile(null);
      setIsChanged(false);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.errors) {
            const validationErrors = Object.values(data.errors)
              .map((msg) => `• ${msg}`)
              .join("\n");
            alert(`Validation Error:\n${validationErrors}`);
          } else if (data.message) {
            alert(`Error: ${data.message}`);
          } else {
            alert("Invalid request. Please check your input.");
          }
        } else if (status === 401) {
          alert("Unauthorized! Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(
            data.message ||
              "An unexpected error occurred. Please try again later."
          );
        }
      }
    }
  };

  const handleToggleRestaurantStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant status");
      return;
    }

    // Confirmation dialog
    const statusAction = isOpen ? "close" : "open";

    const result = await Swal.fire({
      title: `${isOpen ? "Close" : "Open"} Restaurant?`,
      text: `Are you sure you want to ${statusAction} your restaurant?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${statusAction} it!`,
      cancelButtonText: "Cancel",
      confirmButtonColor: isOpen ? "#d33" : "#3fc46d",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      try {
        const newStatus = !isOpen;

        const response = await axios.patch(
          "http://localhost:5000/restaurant/status",
          { isOpen: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setIsOpen(newStatus);
        setInitialIsOpen(newStatus);

        Swal.fire({
          title: "Status Updated!",
          text: `Your restaurant is now ${
            newStatus ? "open" : "closed"
          } for orders`,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update restaurant status",
          icon: "error",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#efb100",
        });
      }
    }
  };

  return (
    <div
      className="flex w-screen min-h-screen bg-yellow-100"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/manageresto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Sidebar />
      <main className="flex-1 flex justify-center items-center p-5">
        <div className="w-full max-w-xl p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6 flex items-center justify-center">
            <FaUtensils className="mr-2" /> Manage Your Restaurant
          </h2>

          {/* Restaurant Status Toggle */}
          <div className="mb-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                {isOpen ? (
                  <FaDoorOpen className="text-green-500 text-xl mr-3" />
                ) : (
                  <FaDoorClosed className="text-red-500 text-xl mr-3" />
                )}
                <div>
                  <h3 className="font-medium">Restaurant Status</h3>
                  <p
                    className={`text-sm ${
                      isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOpen ? "Currently Open" : "Currently Closed"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleRestaurantStatus}
                className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                  isOpen
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-3">
              Restaurant Image
            </label>
            <div className="relative group">
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Restaurant"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition flex items-center">
                        <FaCamera className="mr-2" />
                        Change Image
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer text-gray-500 flex flex-col items-center">
                    <FaImage className="w-12 h-12 mb-2" />
                    <span>Click to upload image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Recommended: 1200x800px, Max size: 5MB
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateRestaurant} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
                <FaUtensils className="ml-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
                <FaMapMarkerAlt className="ml-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your restaurant address"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  required
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!isChanged}
              className={`w-full p-3 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center ${
                isChanged
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <FaSave className="mr-2" /> Update Restaurant
            </button>
          </form>
        </div>

        {/* Floating My Menu Button */}
        <a
          href="../my-menu"
          className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition flex items-center"
        >
          <FaUtensils className="mr-2" /> My Menu
        </a>
      </main>
    </div>
  );
};

export default ManageRestaurant;
