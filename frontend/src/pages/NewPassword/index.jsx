/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "./components/BackgroundImage";
import AuthCard from "./components/AuthCard";
import FormInput from "./components/FormInput";
import SubmitButton from "./components/SubmitButton";
import AuthLink from "./components/AuthLink";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const NewPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }

    // Validate password requirements
    if (password) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long");
      } else if (!/[A-Z]/.test(password)) {
        setPasswordError("Password must contain at least one uppercase letter");
      } else if (!/[a-z]/.test(password)) {
        setPasswordError("Password must contain at least one lowercase letter");
      } else if (!/[0-9]/.test(password)) {
        setPasswordError("Password must contain at least one number");
      } else if (!/[!@#$%^&*]/.test(password)) {
        setPasswordError(
          "Password must contain at least one special character (!@#$%^&*)"
        );
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passwordsMatch || passwordError) {
      return;
    }

    MySwal.fire({
      title: "Password Reset",
      text: "Your password has been successfully reset",
      icon: "success",
      confirmButtonText: "Login Now",
      confirmButtonColor: "#efb100",
    }).then(() => {
      navigate("/login");
    });
  };

  // Check if form is valid
  const isFormValid =
    password && confirmPassword && passwordsMatch && !passwordError;

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <BackgroundImage imagePath="/foodbg.jpg" />

      <AuthCard logoSrc="/logo_FastEats.png" title="New Password">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}

          <FormInput
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {!passwordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}

          <SubmitButton
            text={"Reset Password"}
            disabled={loading || !isFormValid}
          />
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <AuthLink
          text="Remember your password?"
          linkText="Login here"
          to="/login"
        />
      </AuthCard>
    </div>
  );
};

export default NewPassword;
