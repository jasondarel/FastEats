import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import ImageUploader from "./ImageUploader";

const RegisterForm = ({ onRegister, errors, userType }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Seller-specific fields
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (file) => {
    if (file) {
      setRestaurantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const additionalData = {};

    // Add seller-specific data if registering as a seller
    if (userType === "seller") {
      // Check if restaurant image is provided
      if (!restaurantImage) {
        onRegister(name, email, password, confirmPassword, null, {
          image: "Please upload a restaurant image",
        });
        return;
      }

      additionalData.restaurantName = restaurantName;
      additionalData.restaurantAddress = restaurantAddress;
      additionalData.restaurantImage = restaurantImage;
    }

    onRegister(name, email, password, confirmPassword, additionalData);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6 hover:cursor-pointer">
        Register as {userType === "user" ? "Customer" : "Seller"}
      </h2>

      {userType === "user" ? (
        // Single column layout for user registration
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
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
            <ErrorMessage error={errors.confirmPassword} />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Register
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      ) : (
        // Two-column layout for seller registration
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - User Information */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
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
                <ErrorMessage error={errors.confirmPassword} />
              </div>
            </div>

            {/* Right Column - Restaurant Information */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Restaurant Name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.restaurantName} />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Restaurant Address"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.restaurantAddress} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Image
                </label>
                <ImageUploader
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onImageRemove={() => {
                    setImagePreview(null);
                    setRestaurantImage(null);
                  }}
                  error={errors.image}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 mt-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Register
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      )}

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
