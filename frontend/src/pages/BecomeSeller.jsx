import React, { useState, useEffect } from "react";
import becomeSellerService from "../../service/userServices/becomeSellerService";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import { Camera } from "lucide-react";

const BecomeSeller = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role === "seller") {
          navigate("/manage-restaurant");
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      setRestaurantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    setErrors({});
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to become a seller");
      return;
    }

    if (!restaurantImage) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a restaurant image",
      }));
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "user") {
        alert("Only users can become sellers");
        return;
      }

      const formData = new FormData();
      console.log(restaurantName, restaurantAddress, restaurantImage);
      formData.append("restaurantName", restaurantName);
      formData.append("restaurantAddress", restaurantAddress);
      formData.append("restaurantImage", restaurantImage);

      const response = await becomeSellerService(formData, token);

      alert(
        response.data.message + " ..Please login again" ||
          "Successfully became a seller!"
      );
      localStorage.removeItem("token");
      navigate("/login");
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
      // window.location.reload();
    }
  };

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main
        className="flex-1 p-5 min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.6)), url('/manageresto.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Become a Seller
          </h2>
          <form onSubmit={handleBecomeSeller} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                placeholder="Enter your restaurant name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-0 focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Address
              </label>
              <input
                type="text"
                placeholder="Enter your restaurant address"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-0 focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantAddress}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-yellow-500 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Restaurant preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setRestaurantImage(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="restaurant-image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="restaurant-image"
                            name="restaurant-image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer font-medium"
            >
              Register as Seller
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BecomeSeller;
