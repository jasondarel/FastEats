import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors before validation

    try {
      await axios.post("http://localhost:5000/user/register", {
        name,
        email,
        password,
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      const errMsg = error.response?.data?.error || "An error occurred";

      if (errMsg.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: errMsg }));
      }
      if (errMsg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: errMsg }));
      }
      if (errMsg.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: errMsg }));
      }
      if (
        !errMsg.toLowerCase().includes("name") &&
        !errMsg.toLowerCase().includes("email") &&
        !errMsg.toLowerCase().includes("password")
      ) {
        setErrors((prev) => ({ ...prev, general: errMsg }));
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
        <div className="absolute inset-0 bg-gray-900/75"></div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <img
            src="/logo_FastEats.png"
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
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
              Register
            </button>
            {errors.general && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errors.general}
              </p>
            )}
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-500 underline hover:text-yellow-600"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
