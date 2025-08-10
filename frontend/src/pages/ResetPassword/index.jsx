/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import BackgroundImage from "./components/BackgroundImage";
import AuthCard from "./components/AuthCard";
import FormInput from "./components/FormInput";
import SubmitButton from "./components/SubmitButton";
import AuthLink from "./components/AuthLink";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { verifyResetPasswordTokenService, resetPasswordService } from "../../service/userServices/forgotPasswordService";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const MySwal = withReactContent(Swal);
  const query = useQuery();
  const token = query.get("token");

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }
      try {
        const response = await verifyResetPasswordTokenService(token);
        const { success } = response.data;
        setTokenValid(!!success);
        // Optionally handle other messages
      } catch (err) {
        const message = err?.data?.message || "Invalid or expired token.";
        setTokenValid(false);
        
      }
    };
    checkToken();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!password || !confirmPassword) {
      MySwal.fire({
        title: "Error",
        text: "Both password fields are required",
        icon: "error",
      });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Passwords do not match"
      });
      return;
    }
    if (!token || !tokenValid) {
      MySwal.fire({
        title: "Error",
        text: "Invalid or expired token.",
        icon: "error",
      });
      return;
    }
    try {
      const response = await resetPasswordService(token, password, confirmPassword);
      const { success, message } = response.data;
      if (success) {
        MySwal.fire({
          title: "Success",
          text: message || "Password has been reset successfully.",
          icon: "success",
        }).then(() => {
          navigate("/login");
        });
      } else {
        MySwal.fire({
          title: "Error",
          text: message || "Failed to reset password.",
          icon: "error",
        });
      }
    } catch (err) {
      // Assume backend returns { error: { password: "msg", confirmPassword: "msg" } }
      const errors = err.data?.error || {};
      setFieldErrors(errors);
      // For general error, show alert
      if (!errors.password && !errors.confirmPassword) {
        const errMsg = err.data?.message || "Failed to reset password. Please try again later.";
        MySwal.fire({
          title: "Error",
          text: errMsg,
          icon: "error",
        });
      }
    }
  };

  // 3. Show loading or invalid token message
  if (tokenValid === null) {
    return (
      <div className="fixed inset-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <p className="text-lg">Checking reset link...</p>
      </div>
    );
  }
  if (tokenValid === false) {
    return (
      <div className="fixed inset-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <AuthCard logoSrc="/logo_FastEats.png" title="Reset Password">
          <p className="text-red-500 text-center">This reset link is invalid or has expired.</p>
          <AuthLink linkText="Back to Login" to="/login" />
        </AuthCard>
      </div>
    );
  }

  // 4. If token valid, show form
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <BackgroundImage imagePath="/foodbg.jpg" />

      <AuthCard logoSrc="/logo_FastEats.png" title="Reset Password">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <FormInput
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <div>
            <FormInput
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <SubmitButton 
            text={"Reset Password"} 
            disabled={loading}
            onClickSubmit={onSubmit}
          />
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <AuthLink linkText="Back to Login" to="/login" />
      </AuthCard>
    </div>
  );
};

export default ResetPassword;