import React, { useState, useEffect } from "react";
import becomeSellerService from "../../service/userServices/becomeSellerService";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import ImageUploader from "./components/ImageUploader";
import FormInput from "./components/FormInput";
import PageLayout from "./components/PageLayout";

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

  const handleImageChange = (file) => {
    if (file) {
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
    }
  };

  return (
    <PageLayout
      sidebar={<Sidebar />}
      backgroundStyle={{
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
          <FormInput
            label="Restaurant Name"
            placeholder="Enter your restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            error={errors.restaurantName}
            required
          />

          <FormInput
            label="Restaurant Address"
            placeholder="Enter your restaurant address"
            value={restaurantAddress}
            onChange={(e) => setRestaurantAddress(e.target.value)}
            error={errors.restaurantAddress}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Image
            </label>
            <ImageUploader
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={() => {
                setImagePreview(null);
                setRestaurantImage(null);
              }}
              error={errors.image}
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer font-medium"
          >
            Register as Seller
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default BecomeSeller;
