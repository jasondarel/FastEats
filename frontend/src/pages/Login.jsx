import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

//alert
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
    setErrors({}); // Clear previous errors

    try {
      const res = await axios.post("http://localhost:5000/user/login", {
        email,
        password,
      });
      Swal.fire({
        title: "Login Successful",
        text: "You are now logged in",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      })
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      const errors = error.response?.data.errors || "An error occurred";
      setErrors(errors);
      Object.keys(errors).forEach((key) => {
        MySwal.fire({
          title: "Error",
          text: errors[key],
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      });
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
                className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
            Don&apos;t have an account?{" "}
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
