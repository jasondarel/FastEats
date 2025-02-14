import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // Store field-specific errors
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const res = await axios.post("https://d349-61-5-30-124.ngrok-free.app/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      const errMsg = error.response?.data?.error || "An error occurred";
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
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-gray-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/foodbg.jpg')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gray-900/75"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <img
            src="/logo_FastEats.png"
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
            >
              Login
            </button>
          </form>
          {errors.general && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errors.general}
            </p>
          )}
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-yellow-500 underline hover:text-yellow-600"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
