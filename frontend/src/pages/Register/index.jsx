import { useState } from "react";
import registerUser from "../../../service/userServices/registerService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import RegisterForm from "./components/RegisterForm";
import AuthLayout from "./components/AuthLayout";

const Register = () => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const handleRegister = async (name, email, password) => {
    setErrors({}); // Reset errors before validation

    try {
      await registerUser(name, email, password);
      Swal.fire({
        title: "Sucessfully Registered",
        text: "Registration successful! Please login.",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || "An error occurred";

      if (errMsg.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: errMsg }));
      }
      if (errMsg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: errMsg }));
      }
      if (errMsg.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: errMsg }));
      }
      if (
        !errMsg.toLowerCase().includes("name") &&
        !errMsg.toLowerCase().includes("email") &&
        !errMsg.toLowerCase().includes("password")
      ) {
        setErrors((prev) => ({ ...prev, general: errMsg }));
      }
    }
  };

  return (
    <AuthLayout>
      <RegisterForm onRegister={handleRegister} errors={errors} />
    </AuthLayout>
  );
};

export default Register;
