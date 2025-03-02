import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RegisterForm from "./components/RegisterForm";
import AuthLayout from "./components/AuthLayout";
import registerService from "../../../service/userServices/registerService";

const Register = () => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const handleRegister = async (name, email, password, confirmPassword) => {
    setErrors({});

    try {
      const otpToken = await registerService(name, email, password, confirmPassword);
      Swal.fire({
        title: "Sucessfully Registered",
        text: "Registration successful! Check your email for validate your email.",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
            navigate(`/otp-verification?token=${otpToken.data.token}&email=${email}`);
        }
      });
    } catch (error) {
        const errors = error.response?.data.errors || "An error occurred";
        setErrors(errors);
        Object.keys(errors).forEach((key) => {
          MySwal.fire({
            title: "Error",
            text: errors[key],
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#ef4444",
          });
        });
    }
  };

  return (
    <AuthLayout>
      <RegisterForm onRegister={handleRegister} errors={errors} />
    </AuthLayout>
  );
};

export default Register;
