/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import ImageUploader from "./ImageUploader";
import { 
  getCitiesService, 
  getDistrictsService, 
  getProvincesService, 
  getVillagesService 
} from "../../../service/utilServices/utilService";

const RegisterForm = ({ onRegister, errors, userType }) => {
  // User form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Restaurant form states
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantProvince, setRestaurantProvince] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("");
  const [restaurantDistrict, setRestaurantDistrict] = useState("");
  const [restaurantVillage, setRestaurantVillage] = useState("");
  const [restaurantAlamat, setRestaurantAlamat] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Location data states
  const [provinces, setProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false
  });

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingStates(prev => ({ ...prev, provinces: true }));
      try {
        const response = await getProvincesService();
        setProvinces(response || []);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setProvinces([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, provinces: false }));
      }
    };

    if (userType === "seller") {
      fetchProvinces();
    }
  }, [userType]);

  // Fetch cities when province changes
  const fetchCities = useCallback(async (provinceId) => {
    if (!provinceId) {
      setAvailableCities([]);
      return;
    }

    setLoadingStates(prev => ({ ...prev, cities: true }));
    try {
      const response = await getCitiesService(provinceId);
      setAvailableCities(response || []);
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      setAvailableCities([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, cities: false }));
    }
  }, []);

  // Fetch districts when city changes
  const fetchDistricts = useCallback(async (cityId) => {
    if (!cityId) {
      setAvailableDistricts([]);
      return;
    }

    setLoadingStates(prev => ({ ...prev, districts: true }));
    try {
      const response = await getDistrictsService(cityId);
      setAvailableDistricts(response || []);
    } catch (error) {
      console.error(`Error fetching districts for city ${cityId}:`, error);
      setAvailableDistricts([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, districts: false }));
    }
  }, []);

  // Fetch villages when district changes
  const fetchVillages = useCallback(async (districtId) => {
    if (!districtId) {
      setAvailableVillages([]);
      return;
    }

    setLoadingStates(prev => ({ ...prev, villages: true }));
    try {
      const response = await getVillagesService(districtId);
      setAvailableVillages(response || []);
    } catch (error) {
      console.error(`Error fetching villages for district ${districtId}:`, error);
      setAvailableVillages([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, villages: false }));
    }
  }, []);

  // Handle province selection
  useEffect(() => {
    if (restaurantProvince) {
      fetchCities(restaurantProvince);
      // Reset dependent fields
      setRestaurantCity("");
      setRestaurantDistrict("");
      setRestaurantVillage("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    } else {
      setAvailableCities([]);
      setRestaurantCity("");
      setRestaurantDistrict("");
      setRestaurantVillage("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    }
  }, [restaurantProvince, fetchCities]);

  // Handle city selection
  useEffect(() => {
    if (restaurantCity) {
      fetchDistricts(restaurantCity);
      // Reset dependent fields
      setRestaurantDistrict("");
      setRestaurantVillage("");
      setAvailableVillages([]);
    } else {
      setAvailableDistricts([]);
      setRestaurantDistrict("");
      setRestaurantVillage("");
      setAvailableVillages([]);
    }
  }, [restaurantCity, fetchDistricts]);

  // Handle district selection
  useEffect(() => {
    if (restaurantDistrict) {
      fetchVillages(restaurantDistrict);
      // Reset dependent field
      setRestaurantVillage("");
    } else {
      setAvailableVillages([]);
      setRestaurantVillage("");
    }
  }, [restaurantDistrict, fetchVillages]);

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

  const handleImageRemove = () => {
    setImagePreview(null);
    setRestaurantImage(null);
  };

  const validateSellerForm = () => {
    if (!restaurantImage) {
      onRegister(name, email, password, confirmPassword, null, {
        image: "Please upload a restaurant image",
      });
      return false;
    }

    if (
      !restaurantProvince ||
      !restaurantCity ||
      !restaurantDistrict ||
      !restaurantVillage ||
      !restaurantAlamat.trim()
    ) {
      onRegister(name, email, password, confirmPassword, null, {
        general: "Please fill in all address fields",
      });
      return false;
    }

    return true;
  };

  const buildFullAddress = () => {
    const selectedProvince = provinces.find(p => p.id === restaurantProvince);
    const selectedCity = availableCities.find(c => c.id === restaurantCity);
    const selectedDistrict = availableDistricts.find(d => d.id === restaurantDistrict);
    const selectedVillage = availableVillages.find(v => v.id === restaurantVillage);

    return `${restaurantAlamat}, ${
      selectedVillage?.name || ""
    }, ${selectedDistrict?.name || ""}, ${selectedCity?.name || ""}, ${
      selectedProvince?.name || ""
    }`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const additionalData = {};

    if (userType === "seller") {
      if (!validateSellerForm()) {
        return;
      }

      const fullAddress = buildFullAddress();

      additionalData.restaurantName = restaurantName;
      additionalData.restaurantAddress = fullAddress;
      additionalData.restaurantProvince = restaurantProvince;
      additionalData.restaurantCity = restaurantCity;
      additionalData.restaurantDistrict = restaurantDistrict;
      additionalData.restaurantVillage = restaurantVillage;
      additionalData.restaurantAlamat = restaurantAlamat;
      additionalData.restaurantImage = restaurantImage;
    }

    onRegister(name, email, password, confirmPassword, additionalData);
  };

  const renderSelectField = (
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    loading = false,
    error = null
  ) => (
    <div>
      <select
        value={value}
        onChange={onChange}
        required={userType === "seller"}
        disabled={disabled || loading}
        className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white disabled:bg-gray-100"
      >
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <ErrorMessage error={error} />
    </div>
  );

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6">
        Register as {userType === "user" ? "Customer" : "Seller"}
      </h2>

      {userType === "user" ? (
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
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
          >
            Register
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h3>
              
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
              <h3 className="text-lg font-medium text-gray-700 mb-4">Restaurant Information</h3>
              
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

              {/* Address Fields */}
              {renderSelectField(
                restaurantProvince,
                (e) => setRestaurantProvince(e.target.value),
                provinces,
                "Select Province",
                false,
                loadingStates.provinces,
                errors.restaurantProvince
              )}

              {renderSelectField(
                restaurantCity,
                (e) => setRestaurantCity(e.target.value),
                availableCities,
                "Select City/Regency",
                !restaurantProvince,
                loadingStates.cities,
                errors.restaurantCity
              )}

              {renderSelectField(
                restaurantDistrict,
                (e) => setRestaurantDistrict(e.target.value),
                availableDistricts,
                "Select District",
                !restaurantCity,
                loadingStates.districts,
                errors.restaurantDistrict
              )}

              {renderSelectField(
                restaurantVillage,
                (e) => setRestaurantVillage(e.target.value),
                availableVillages,
                "Select Village",
                !restaurantDistrict,
                loadingStates.villages,
                errors.restaurantVillage
              )}

              <div>
                <textarea
                  placeholder="Detailed Address (Street, House Number, etc.)"
                  value={restaurantAlamat}
                  onChange={(e) => setRestaurantAlamat(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
                <ErrorMessage error={errors.restaurantAlamat} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Image *
                </label>
                <ImageUploader
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  error={errors.image}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 mt-8 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 font-medium"
          >
            Register as Seller
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      )}

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-yellow-500 hover:text-yellow-600 font-medium transition duration-200"
        >
          Login here
        </Link>
      </p>
    </>
  );
};

export default RegisterForm;