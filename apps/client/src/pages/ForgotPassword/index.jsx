/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "./components/BackgroundImage";
import AuthCard from "./components/AuthCard";
import FormInput from "./components/FormInput";
import SubmitButton from "./components/SubmitButton";
import AuthLink from "./components/AuthLink";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { sendResetEmailService } from "../../service/userServices/forgotPasswordService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const MySwal = withReactContent(Swal);

  const onSubmit = async(e) => {
    e.preventDefault();
    if (!email) {
      MySwal.fire({
        title: "Error",
        text: "Email is required",
        icon: "error",
      });
      return;
    }
    try {
      const response = await sendResetEmailService(email);
      const {success, message} = response.data;
      if (success) {
        MySwal.fire({
          title: "Success",
          text: message,
          icon: "success",
        }).then(() => {
          navigate("/login");
        });
      } else {
        MySwal.fire({
          title: "Error",
          text: message,
          icon: "error",
        });
      }
    } catch(err) {
      console.error("Error during password reset:", err);
      MySwal.fire({
        title: "Error",
        text: "Failed to send reset email. Please try again later.",
        icon: "error",
      });
    }
  }

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <BackgroundImage imagePath="/foodbg.jpg" />

      <AuthCard logoSrc="/logo_FastEats.png" title="Forgot Password">
        <form className="space-y-4">
          <FormInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <SubmitButton 
          text={"Send E-mail"} 
          disabled={loading}
          onClickSubmit={onSubmit} />
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <AuthLink linkText="Back to Login" to="/login" />
      </AuthCard>
    </div>
  );
};

export default ForgotPassword;
