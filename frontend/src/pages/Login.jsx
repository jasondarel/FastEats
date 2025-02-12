import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/profile");
    } catch (error) {
      alert("Login failed: " + error.response?.data?.error);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-gray-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/loginregisterbg.jpg')" }} // Make sure the image is inside public/
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gray-900/75"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <img
            src="/logo_FastEats.png" //logo
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
