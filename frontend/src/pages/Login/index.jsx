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
import { USER_URL } from "../../config/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const MySwal = withReactContent(Swal);
  const handleGoogleLogin = () => {
  window.location.href = `${'http://localhost:5000'}/user/auth/google`;
};

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

          <div className="relative w-full">
            <div className="flex items-center justify-center my-6">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="bg-white px-4 text-gray-500 text-sm">or</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="hover:cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
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