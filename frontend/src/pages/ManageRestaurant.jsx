import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import { FaUtensils, FaMapMarkerAlt, FaSave, FaImage, FaCamera } from "react-icons/fa";

const ManageRestaurant = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [initialRestaurantName, setInitialRestaurantName] = useState("");
  const [initialRestaurantAddress, setInitialRestaurantAddress] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRestaurantData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/restaurant/restaurant", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Response:", response.data);
        const { restaurant } = response.data;
        if (restaurant) {
          setRestaurantName(restaurant.restaurant_name);
          setRestaurantAddress(restaurant.restaurant_address);
          setInitialRestaurantName(restaurant.restaurant_name);
          setInitialRestaurantAddress(restaurant.restaurant_address);
  
          // Pastikan URL gambar sudah benar
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsChanged(true);
    }
  };

  // Check if the form values have changed
  useEffect(() => {
    if (
      restaurantName !== initialRestaurantName ||
      restaurantAddress !== initialRestaurantAddress ||
      imageFile
    ) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [restaurantName, restaurantAddress, initialRestaurantName, initialRestaurantAddress, imageFile]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    if (!isChanged) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant");
      return;
    }

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append("restaurantName", restaurantName);
      formData.append("restaurantAddress", restaurantAddress);
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
      
      alert(response.data.message || "Successfully updated the restaurant!");
      setInitialRestaurantName(restaurantName);
      setInitialRestaurantAddress(restaurantAddress);
      setImageFile(null);
      setIsChanged(false);
      window.location.reload();
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