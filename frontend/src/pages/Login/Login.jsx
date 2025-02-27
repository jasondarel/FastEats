// pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../../service/userServices/loginService";
import BackgroundImage from "./components/BackgroundImage";
import AuthCard from "./components/AuthCard";
import FormInput from "./components/FormInput";
import SubmitButton from "./components/SubmitButton";
import AuthLink from "./components/AuthLink";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = await loginService(email, password);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (errMsg) {
      console.log(errMsg);
      if (errMsg.includes("email")) {
        setErrors({ email: errMsg });
      } else if (errMsg.includes("password")) {
        setErrors({ password: errMsg });
      } else {
        setErrors({ general: errMsg });
      }
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
