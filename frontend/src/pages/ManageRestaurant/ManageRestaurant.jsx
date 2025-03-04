import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRestaurantData,
  updateRestaurant,
  toggleRestaurantStatus,
} from "../../../service/restaurantServices/manageRestaurantService";
import Sidebar from "../../components/Sidebar";
import RestaurantStatusToggle from "./components/RestaurantStatusToggle";
import RestaurantImageUploader from "./components/RestaurantImageUploader";
import RestaurantDetailsForm from "./components/RestaurantDetailsForm";
import FloatingMenuButton from "./components/FloatingMenuButton";
import { FaUtensils } from "react-icons/fa";
import Swal from "sweetalert2";

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
  const [bcaAccount, setBcaAccount] = useState("");
  const [gopay, setGopay] = useState("");
  const [dana, setDana] = useState("");
  const [initialBcaAccount, setInitialBcaAccount] = useState("");
  const [initialGopay, setInitialGopay] = useState("");
  const [initialDana, setInitialDana] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRestaurantData = async () => {
      try {
        const response = await getRestaurantData(token);
        const { restaurant, user_payments } = response.data;
        if (restaurant) {
          setRestaurantName(restaurant.restaurant_name);
          setRestaurantAddress(restaurant.restaurant_address);
          setInitialRestaurantName(restaurant.restaurant_name);
          setInitialRestaurantAddress(restaurant.restaurant_address);
          setIsOpen(restaurant.is_open || false);
          setInitialIsOpen(restaurant.is_open || false);

          if (user_payments) {
            setBcaAccount(user_payments.bank_bca);
            setGopay(user_payments.gopay);
            setDana(user_payments.dana);
            setInitialBcaAccount(user_payments.bank_bca);
            setInitialGopay(user_payments.gopay);
            setInitialDana(user_payments.dana);
          }

          const imageUrl = restaurant.restaurant_image
            ? `http://localhost:5000/restaurant/uploads/restaurant/${restaurant.restaurant_image}`
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
      isOpen !== initialIsOpen ||
      imageFile ||
      bcaAccount !== initialBcaAccount ||
      gopay !== initialGopay ||
      dana !== initialDana
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
    bcaAccount,
    gopay,
    dana,
    initialBcaAccount,
    initialGopay,
    initialDana,
  ]);

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
      formData.append("bcaAccount", bcaAccount);
      formData.append("gopay", gopay);
      formData.append("dana", dana);
      if (imageFile) {
        formData.append("restaurantImage", imageFile);
      } else if (formDataState && formDataState.restaurantImage) {
        formData.append("restaurantImage", formDataState.restaurantImage);
      } else {
        formData.append("restaurantImage", null);
      }

      await updateRestaurant(token, formData);

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
      setInitialBcaAccount(bcaAccount);
      setInitialGopay(gopay);
      setInitialDana(dana);
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
      className="flex overflow-x-hidden w-full min-h-screen bg-yellow-100"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/manageresto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Sidebar />
      <main className="md:ml-20 flex-1 flex justify-center items-center p-5 overflow-x-hidden">
        <div className="w-full max-w-xl p-4 sm:p-8 bg-white shadow-xl rounded-xl overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-yellow-600 mb-6 flex items-center justify-center">
            <FaUtensils className="mr-2" />
            <span className="truncate">Manage Your Restaurant</span>
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
            restaurantAddress={restaurantAddress}
            setRestaurantAddress={setRestaurantAddress}
            bcaAccount={bcaAccount}
            setBcaAccount={setBcaAccount}
            gopay={gopay}
            setGopay={setGopay}
            dana={dana}
            setDana={setDana}
            isChanged={isChanged}
            onSubmit={handleUpdateRestaurant}
          />
        </div>

        <FloatingMenuButton />
      </main>
    </div>
  );
};

export default ManageRestaurant;
