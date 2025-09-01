/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRestaurantData,
  updateRestaurant,
  toggleRestaurantStatus,
} from "../../service/restaurantService/manageRestaurantService";
import Sidebar from "../../components/Sidebar";
import RestaurantStatusToggle from "./components/RestaurantStatusToggle";
import RestaurantImageUploader from "./components//RestaurantImageUploader";
import RestaurantDetailsForm from "./components/RestaurantDetailsForm";
import FloatingMenuButton from "./components/FloatingMenuButton";
import { FaUtensils } from "react-icons/fa";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

const ManageRestaurant = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantProvince, setRestaurantProvince] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("");
  const [restaurantDistrict, setRestaurantDistrict] = useState("");
  const [restaurantVillage, setRestaurantVillage] = useState("");
  const [initialRestaurantName, setInitialRestaurantName] = useState("");
  const [initialRestaurantAddress, setInitialRestaurantAddress] = useState("");
  const [initialRestaurantProvince, setInitialRestaurantProvince] = useState("");
  const [initialRestaurantCity, setInitialRestaurantCity] = useState("");
  const [initialRestaurantDistrict, setInitialRestaurantDistrict] = useState("");
  const [initialRestaurantVillage, setInitialRestaurantVillage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [initialIsOpen, setInitialIsOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formDataState, setFormDataState] = useState({
    menuName: "",
    menuDesc: "",
    menuPrice: "",
    menuCategory: "",
    menuImage: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRestaurantData = async () => {
      try {
        const response = await getRestaurantData(token);
        const { restaurant } = response.data;
        console.log("Restaurant data:", restaurant);
        if (restaurant) {
          setFormDataState({
            restaurantName: restaurant.restaurant_name || "",
            restaurantImage: restaurant.restaurant_image || "",
          });
          setRestaurantName(restaurant.restaurant_name);
          setRestaurantAddress(restaurant.restaurant_address);
          setRestaurantProvince(restaurant.restaurant_province || "");
          setInitialRestaurantName(restaurant.restaurant_name);
          setInitialRestaurantProvince(
            restaurant.restaurant_province || "");
          
          setInitialRestaurantCity(restaurant.restaurant_city || "");
          setRestaurantCity(restaurant.restaurant_city || "");
          setInitialRestaurantDistrict(restaurant.restaurant_district || "");
          setRestaurantDistrict(restaurant.restaurant_district || "");
          setInitialRestaurantVillage(restaurant.restaurant_village || "");
          setRestaurantVillage(restaurant.restaurant_village || "");
          setInitialRestaurantAddress(restaurant.restaurant_address);

          setIsOpen(restaurant.is_open || false);
          setInitialIsOpen(restaurant.is_open || false);

          const imageUrl = restaurant.restaurant_image
            ? `${API_URL}/restaurant/uploads/restaurant/${restaurant.restaurant_image}`
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

  const handleImageChange = (file) => {
    if (file) {
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
      restaurantProvince !== initialRestaurantProvince ||
      restaurantCity !== initialRestaurantCity ||
      restaurantDistrict !== initialRestaurantDistrict ||
      restaurantVillage !== initialRestaurantVillage ||
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
    restaurantProvince,
    restaurantCity,
    restaurantDistrict,
    restaurantVillage,
    initialRestaurantProvince,
    initialRestaurantCity,
    initialRestaurantDistrict,
    initialRestaurantVillage,
    isOpen,
    initialIsOpen,
    imageFile,
  ]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    if (!isChanged) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant");
      return;
    }
    console.log("Updating restaurant with data:", {
      restaurantName,
      restaurantAddress,
      restaurantProvince,
      restaurantCity,
      restaurantDistrict,
      restaurantVillage,
      isOpen,
      imageFile,
  });
    try {
      const formData = new FormData();
      formData.append("restaurantName", restaurantName);
      formData.append("restaurantAddress", restaurantAddress);
      formData.append("restaurantProvince", restaurantProvince);
      formData.append("restaurantCity", restaurantCity);
      formData.append("restaurantDistrict", restaurantDistrict);
      formData.append("restaurantVillage", restaurantVillage);
      formData.append("isOpen", isOpen);
      if (imageFile) {
        formData.append("restaurantImage", imageFile);
      } else {
        formData.append(
          "restaurantImage",
          formDataState.restaurantImage ? formDataState.restaurantImage : null
        );
      }

      await updateRestaurant(token, formData);

      Swal.fire({
        title: "Success!",
        text: "Successfully updated the restaurant",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });

      setInitialRestaurantName(restaurantName);
      setInitialRestaurantProvince(restaurantProvince);
      setInitialRestaurantCity(restaurantCity);
      setInitialRestaurantDistrict(restaurantDistrict);
      setInitialRestaurantVillage(restaurantVillage);
      setInitialRestaurantAddress(restaurantAddress);
      setInitialIsOpen(isOpen);
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

        await toggleRestaurantStatus(token, newStatus);

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
      <main className="md:ml-20 flex-1 flex justify-center items-center p-5 min-w-[300px]">
        <div className="w-full max-w-xl p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6 flex items-center justify-center">
            <FaUtensils className="mr-2" /> Manage Your Restaurant
          </h2>

          <RestaurantStatusToggle
            isOpen={isOpen}
            onToggle={handleToggleRestaurantStatus}
          />

          <RestaurantImageUploader
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />

          <RestaurantDetailsForm
            restaurantName={restaurantName}
            setRestaurantName={setRestaurantName}
            restaurantProvince={restaurantProvince}
            setRestaurantProvince={setRestaurantProvince}
            restaurantCity={restaurantCity}
            setRestaurantCity={setRestaurantCity}
            restaurantDistrict={restaurantDistrict}
            setRestaurantDistrict={setRestaurantDistrict}
            restaurantVillage={restaurantVillage}
            setRestaurantVillage={setRestaurantVillage}
            restaurantAddress={restaurantAddress}
            setRestaurantAddress={setRestaurantAddress}
            isChanged={isChanged}
            onSubmit={handleUpdateRestaurant}
            initialRestaurantProvince={initialRestaurantProvince}
            initialRestaurantCity={initialRestaurantCity}
            initialRestaurantDistrict={initialRestaurantDistrict}
          />
        </div>

        <FloatingMenuButton />
      </main>
    </div>
  );
};

export default ManageRestaurant;
