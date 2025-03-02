// pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../../service/userServices/loginService";
import BackgroundImage from "./components/BackgroundImage";
import AuthCard from "./components/AuthCard";
import FormInput from "./components/FormInput";
import SubmitButton from "./components/SubmitButton";
import AuthLink from "./components/AuthLink";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
        const data = await loginService(email, password);
        Swal.fire({
        title: "Login Successful",
        text: "You are now logged in",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
        });  
      localStorage.setItem("token", data.data.token);
      navigate("/");
    } catch (error) {
        if(error.status == 401) {
          MySwal.fire({
            title: "Error",
            text: "Your Email is not verified yet. Please verify your email first.",
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#ef4444",
          })
          const {token} = error.data;
          navigate(`/otp-verification?token=${token}&email=${email}`);
          return;
        }
        
        Object.keys(errors).forEach((key) => {
          MySwal.fire({
            title: "Error",
            text: errors[key],
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#ef4444",
          });
        });
        setErrors(error.data.errors);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <BackgroundImage imagePath="/foodbg.jpg" />

      <AuthCard logoSrc="/logo_FastEats.png" title="Login">
        <form onSubmit={handleLogin} className="space-y-4">
          <FormInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <FormInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <SubmitButton text="Login" />
        </form>

        {errors.general && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {errors.general}
          </p>
        )}

        <AuthLink
          text="Don't have an account?"
          linkText="Register here"
          to="/register"
        />
      </AuthCard>
    </div>
  );
};

export default Login;
