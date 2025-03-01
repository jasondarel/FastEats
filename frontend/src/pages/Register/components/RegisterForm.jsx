import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

const RegisterForm = ({ onRegister, errors }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(name, email, password, confirmPassword);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <ErrorMessage error={errors.name} />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <ErrorMessage error={errors.email} />
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
          <ErrorMessage error={errors.password} />
        </div>
        <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
        <button
          type="submit"
          className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
        >
          Register
        </button>
        <ErrorMessage error={errors.general} center />
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
    </>
  );
};

export default RegisterForm;
