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
        if (error.status === 401) {
          MySwal.fire({
            title: "Error",
            text: "Your Email is not verified yet. Please verify your email first.",
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#ef4444",
          });
          navigate(
            `/otp-verification?token=${error.data.token}&email=${email}`
          );
          return;
        }

        MySwal.fire({
          title: "Login Failed",
          text: error.message || "Invalid credentials",
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      });
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
