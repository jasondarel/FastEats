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
import { loginUser } from "../../app/auth/authThunk";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const MySwal = withReactContent(Swal);

  const handleLogin = async (e) => {
    e.preventDefault();

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((response) => {
        console.log("Login response:", response);

        Swal.fire({
          title: "Login Successful",
          text: "You are now logged in",
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });

        if (response.token) {
          try {
            const payload = response.token.split(".")[1];
            const decodedPayload = JSON.parse(atob(payload));
            console.log("Decoded token payload:", decodedPayload);

            if (decodedPayload && decodedPayload.role === "seller") {
              console.log(
                "Seller detected, navigating to restaurant dashboard"
              );
              navigate("/restaurant-dashboard");
              return;
            }
          } catch (error) {
            console.error("Error decoding JWT token:", error);
          }
        }

        console.log("Navigating to home");
        navigate("/home");
      })
      .catch((error) => {
        console.log("Login error:", error);
        console.log("Error status:", error.status);
        if (
          error.status === 401 || 
          (error && error.message && error.message.includes("not verified"))
        ) {
          if (error && error.token) {
            const errorMsg = error.data?.errors || error.data?.message || "Email not verified";
            console.log("Token found, redirecting to verification page");
            MySwal.fire({
              title: "Email Not Verified",
              text: errorMsg,
              icon: "warning",
              showCancelButton: false,
              confirmButtonColor: "#efb100",
              confirmButtonText: "Proceed to Verification"
            }).then((result) => {
              if (result.isConfirmed) {
                navigate(`/otp-verification?token=${error.token}&email=${email}`);
              }
            });
          } else if (error.status === 400) {
            let errorMessage = "Unable to proceed with email verification. Please contact support.";
            
            if (error.data?.errors) {
              if (typeof error.data.errors === 'object' && !Array.isArray(error.data.errors)) {
                // Get first error from object
                errorMessage = Object.values(error.data.errors).flat()[0] || errorMessage;
              } else if (typeof error.data.errors === 'string') {
                errorMessage = error.data.errors;
              }
            }
            
            const htmlContent = `
              <div class="text-center flex flex-col items-center justify-center">
                <div style="display: flex; align-items: center;">
                  <div style="min-width: 24px; height: 24px; border-radius: 50%; background-color: #ef4444; margin-right: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">•</div>
                  <span>${errorMessage}</span>
                </div>
              </div>
            `;
            
            MySwal.fire({
              title: "Incorrect Credentials",
              html: htmlContent,
              icon: "error",
              confirmButtonText: "Ok",
              confirmButtonColor: "#ef4444",
            });
            return;
          } else {
            const errorMsg = error.data?.errors || error.data?.message || "Email not verified";
            
            const htmlContent = `
              <div class="text-center flex flex-col items-center justify-center">
                <div style="display: flex; align-items: center;">
                  <div style="min-width: 24px; height: 24px; border-radius: 50%; background-color: #ef4444; margin-right: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">•</div>
                  <span>${errorMsg}</span>
                </div>
              </div>
            `;
            
            MySwal.fire({
              title: "Verification Error",
              html: htmlContent,
              icon: "error",
              confirmButtonText: "Ok",
              confirmButtonColor: "#ef4444",
            });
          }
          return;
        }
        console.log("Invalid credentials or other error");
        let errorMessage = "Invalid credentials";
        
        if (error.data?.errors) {
          if (typeof error.data.errors === 'object' && !Array.isArray(error.data.errors)) {
            errorMessage = Object.values(error.data.errors).flat()[0] || errorMessage;
          } else if (typeof error.data.errors === 'string') {
            errorMessage = error.data.errors;
          }
        }
        
        const htmlContent = `
          <div class="text-center flex flex-col items-center justify-center">
            <div style="display: flex; align-items: center;">
              <div style="min-width: 24px; height: 24px; border-radius: 50%; background-color: #ef4444; margin-right: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">•</div>
              <span>${errorMessage}</span>
            </div>
          </div>
        `;
        
        MySwal.fire({
          title: "Login Failed",
          html: htmlContent,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      });
  };

  return (
    <div className="inset-0 w-screen h-screen">
      <BackgroundImage imagePath="/foodbg.jpg" />

      <AuthCard logoSrc="/logo_FastEats.png" title="Login">
        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <FormInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-yellow-500 hover:text-yellow-600"
            >
              Forgot Password?
            </a>
          </div>

          <SubmitButton
            text={loading ? "Logging in..." : "Login"}
            disabled={loading}
          />
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
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