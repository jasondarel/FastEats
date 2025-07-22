import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <- for URL query
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RegisterForm from "./components/RegisterForm";
import AuthLayout from "./components/AuthLayout";
import { completeGoogleRegistrationService } from "../../service/userServices/registerService";
import BackgroundImage from "./components/BackgroundImage";

const RegisterGoogle = () => {
  const [errors, setErrors] = useState({});
  const [userType, setUserType] = useState("user");
  const [googleProfile, setGoogleProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const data = query.get("data");
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setGoogleProfile(parsed);
      } catch (err) {
        console.error("Failed to parse Google data", err);
      }
    }
  }, [location]);

  const handleRegister = async (
    name,
    _email,
    _password,
    _confirmPassword,
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
      const registrationPayload = {
        ...googleProfile,
        name,
        role: userType,
        ...additionalData,
      };

      const newUser = await completeGoogleRegistrationService(
        googleProfile,
        registrationPayload
      );

      Swal.fire({
        title: "Successfully Registered",
        text: `Welcome, ${newUser.name}!`,
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then(() => {
        navigate("/auth/google/success");
      });
    } catch (error) {
      const err = error?.response?.data?.errors || {
        general: "An error occurred",
      };
      setErrors(err);
      const firstError = Object.values(err)[0];
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

        {googleProfile && (
          <RegisterForm
            onRegister={handleRegister}
            errors={errors}
            userType={userType}
            isGoogle={true}
            googleData={googleProfile}
          />
        )}
      </AuthLayout>
    </div>
  );
};

export default RegisterGoogle;
