import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RegisterForm from "../Register/components/RegisterForm";
import AuthLayout from "./components/AuthLayout";
import { registerService } from "../../service/userServices/registerService";
import BackgroundImage from "./components/BackgroundImage";

const Register = () => {
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState("user");
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const handleRegister = async (
    name,
    email,
    password,
    confirmPassword,
    additionalData = {},
    customErrors = null
  ) => {
    if (customErrors) {
      setErrors(customErrors);

      const firstError = Object.values(customErrors)[0];
      if (firstError) {
        MySwal.fire({
          title: "Error",
          text: firstError,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      }
      return;
    }

    setErrors({});

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      formData.append("role", userType);

      if (userType === "seller" && additionalData) {
        formData.append("restaurantName", additionalData.restaurantName);
        formData.append(
          "restaurantProvince",
          additionalData.restaurantProvince
        );
        formData.append("restaurantCity", additionalData.restaurantCity);
        formData.append(
          "restaurantDistrict",
          additionalData.restaurantDistrict
        );
        formData.append("restaurantVillage", additionalData.restaurantVillage);
        formData.append("restaurantAddress", additionalData.restaurantAddress);

        if (additionalData.restaurantImage) {
          formData.append("restaurantImage", additionalData.restaurantImage);
        }
      }

      const otpToken = await registerService(formData, userType);

      Swal.fire({
        title: "Successfully Registered",
        text: `${
          userType.charAt(0).toUpperCase() + userType.slice(1)
        } registration successful! Check your email to validate your account.`,
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        console.log("Registration result:", result);
        console.log("OTP Token:", otpToken);
        if (result.isConfirmed) {
          navigate(`/otp-verification?token=${otpToken}&email=${email}`);
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errors = error || {
        general: "An error occurred",
      };
      setErrors(errors);

      const firstError = Object.values(errors)[0];
      if (firstError) {
        MySwal.fire({
          title: "Error",
          text: firstError,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const toggleUserType = (type) => {
    setUserType(type);
    setErrors({});
  };

  return (
    <div className="inset-0 w-screen h-screen">
      <BackgroundImage imagePath="/foodbg.jpg" />
      <AuthLayout isSellerRegister={userType === "seller"}>
        <div className="mb-4 md:mb-2">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 font-medium ${
                userType === "user"
                  ? "text-yellow-500 border-b-2 border-yellow-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => toggleUserType("user")}
            >
              Register as Customer
            </button>
            <button
              className={`flex-1 py-2 font-medium ${
                userType === "seller"
                  ? "text-yellow-500 border-b-2 border-yellow-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => toggleUserType("seller")}
            >
              Register as Seller
            </button>
          </div>
        </div>

        <RegisterForm
          onRegister={handleRegister}
          errors={errors}
          userType={userType}
        />
      </AuthLayout>
    </div>
  );
};

export default Register;
