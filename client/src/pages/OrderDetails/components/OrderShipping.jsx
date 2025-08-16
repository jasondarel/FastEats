/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  getProvincesService,
  getCitiesService,
  getDistrictsService,
  getVillagesService,
  getProvinceService,
  getCityService,
  getDistrictService,
  getVillageService
} from "../../../service/utilServices/utilService";
import { getProfileService } from "../../../service/userServices/profileService";
import { LuTriangleAlert } from "react-icons/lu";

const OrderShipping = ({ 
  onShippingValidationChange, 
  onShippingDataChange,
}) => {
  const token = localStorage.getItem("token");
  const [useCurrentInfo, setUseCurrentInfo] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [currentUserInfoDetail, setCurrentUserInfoDetail] = useState(null);
  const [shippingData, setShippingData] = useState({
    province: "",
    city: "",
    district: "",
    village: "",
    address: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
    userInfo: false,
  });

  const [errors, setErrors] = useState({});

  const getProvinceName = async(provinceId) => {
    try {
      const response = await getProvinceService(provinceId);
      return response.data?.name || "Unknown Province";
    } catch (error) {
      console.error("Error fetching province name:", error);
      return "Unknown Province";
    }
  }

  const getCityName = async(cityId) => {
    try {
      const response = await getCityService(cityId);
      return response.data?.name || "Unknown City";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Unknown City";
    }
  }

  const getDistrictName = async(districtId) => {
    try {
      const response = await getDistrictService(districtId);
      return response.data?.name || "Unknown District";
    } catch (error) {
      console.error("Error fetching district name:", error);
      return "Unknown District";
    }
  }

  const getVillageName = async(villageId) => {
    try {
      const response = await getVillageService(villageId);
      return response.data?.name || "Unknown Village";
    } catch (error) {
      console.error("Error fetching village name:", error);
      return "Unknown Village";
    }
  }

  // Load current user information
  const loadCurrentUserInfo = async () => {
    if (!token) return;
    
    setLoading((prev) => ({ ...prev, userInfo: true }));
    try {
      const response = await getProfileService(token);
      const userResponse = response.data?.user || response.data;
      if (userResponse) {
        const userInfo = {
          province: userResponse.province || "Not specified",
          city:  userResponse.city || "Not specified",
          district: userResponse.district || "Not specified",
          village: userResponse.village || "Not specified",
          address: userResponse.address || "Not specified",
          fullName: userResponse.name || userResponse.data.name || "User",
          phone: userResponse?.phone_number || userResponse?.data?.phone_number || "Unknown Phone Number",
        };
        console.log("User Info: ", userInfo);
        setCurrentUserInfoDetail({
          province: await getProvinceName(userResponse.province),
          city: await getCityName(userResponse.city),
          district: await getDistrictName(userResponse.district),
          village: await getVillageName(userResponse.village),
          address: userResponse.address || "Not specified",
          fullName: userResponse.name || userResponse.data.name || "User",
          phone: userResponse?.phone_number || userResponse?.data?.phone_number || "Unknown Phone Number",
        })
        setCurrentUserInfo(userInfo);
      }
    } catch (err) {
      console.error("Error loading current user info:", err);
      setErrors((prev) => ({ ...prev, userInfo: "Failed to load user information" }));
    } finally {
      setLoading((prev) => ({ ...prev, userInfo: false }));
    }
  };

  useEffect(() => {
    loadProvinces();
    loadCurrentUserInfo();
  }, []);

  useEffect(() => {
    const isShippingValid = () => {
      console.log("Checking shipping validity with useCurrentInfo:", useCurrentInfo);
      if (useCurrentInfo) {
        return currentUserInfo && 
          (currentUserInfo.province !== "Unknown") && 
          (currentUserInfo.city !== "Unknown") && 
          (currentUserInfo.district !== "Unknown") && 
          (currentUserInfo.village !== "Unknown") && 
          (currentUserInfo.address !== "Unknown")
      }

      return (
        shippingData.province &&
        shippingData.city &&
        shippingData.district &&
        shippingData.village &&
        shippingData.address.trim()
      );
    };

    const valid = isShippingValid();
    
    // Notify parent of validation status
    if (onShippingValidationChange) {
      onShippingValidationChange(valid);
    }

    // Notify parent of shipping data
    if (onShippingDataChange) {
      const dataToSend = useCurrentInfo ? currentUserInfo : shippingData;
      onShippingDataChange({
        useCurrentInfo,
        shippingData: dataToSend,
        isValid: valid
      });
    }
  }, [useCurrentInfo, shippingData, currentUserInfo, onShippingValidationChange, onShippingDataChange]);

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    setErrors((prev) => ({ ...prev, provinces: null }));
    
    try {
      const response = await getProvincesService();
      setProvinces(response.data || []);
    } catch (error) {
      console.error("Error loading provinces:", error);
      setErrors((prev) => ({ ...prev, provinces: "Failed to load provinces" }));
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async (provinceId) => {
    if (!provinceId) {
      setCities([]);
      return;
    }

    setLoading((prev) => ({ ...prev, cities: true }));
    setErrors((prev) => ({ ...prev, cities: null }));
    
    try {
      const response = await getCitiesService(provinceId);
      setCities(response.data || []);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
      setErrors((prev) => ({ ...prev, cities: "Failed to load cities" }));
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  const loadDistricts = async (cityId) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }

    setLoading((prev) => ({ ...prev, districts: true }));
    setErrors((prev) => ({ ...prev, districts: null }));
    
    try {
      const response = await getDistrictsService(cityId);
      setDistricts(response.data || []);
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistricts([]);
      setErrors((prev) => ({ ...prev, districts: "Failed to load districts" }));
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const loadVillages = async (districtId) => {
    if (!districtId) {
      setVillages([]);
      return;
    }

    setLoading((prev) => ({ ...prev, villages: true }));
    setErrors((prev) => ({ ...prev, villages: null }));
    
    try {
      const response = await getVillagesService(districtId);
      setVillages(response.data || []);
    } catch (error) {
      console.error("Error loading villages:", error);
      setVillages([]);
      setErrors((prev) => ({ ...prev, villages: "Failed to load villages" }));
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors when user starts typing
    setErrors((prev) => ({ ...prev, [field]: null }));

    if (field === "province") {
      setShippingData((prev) => ({
        ...prev,
        city: "",
        district: "",
        village: "",
      }));
      setCities([]);
      setDistricts([]);
      setVillages([]);
      if (value) {
        loadCities(value);
      }
    } else if (field === "city") {
      setShippingData((prev) => ({
        ...prev,
        district: "",
        village: "",
      }));
      setDistricts([]);
      setVillages([]);
      if (value) {
        loadDistricts(value);
      }
    } else if (field === "district") {
      setShippingData((prev) => ({
        ...prev,
        village: "",
      }));
      setVillages([]);
      if (value) {
        loadVillages(value);
      }
    }
  };

  const handleUseCurrentInfoChange = (useCurrent) => {
    setUseCurrentInfo(useCurrent);
    setErrors({});

    if (useCurrent) {
      // Reset manual input data
      setShippingData({
        province: "",
        city: "",
        district: "",
        village: "",
        address: "",
      });
      setCities([]);
      setDistricts([]);
      setVillages([]);
    }
  };

  const getFieldError = (field) => {
    if (useCurrentInfo) return null;
    
    const fieldMap = {
      province: !shippingData.province,
      city: !shippingData.city && shippingData.province,
      district: !shippingData.district && shippingData.city,
      village: !shippingData.village && shippingData.district,
      address: !shippingData.address.trim()
    };

    return fieldMap[field];
  };

  return (
    <div>
      <div className="mt-8 p-6 bg-amber-50 rounded-lg">
        <h3 className="text-xl font-semibold text-amber-900 mb-4">
          Shipping Information
        </h3>

        {/* Toggle buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => handleUseCurrentInfoChange(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              useCurrentInfo
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Use Current Address
          </button>
          <button
            onClick={() => handleUseCurrentInfoChange(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !useCurrentInfo
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Use Different Address
          </button>
        </div>

        {/* Current user info display */}
        {useCurrentInfo && (
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            {loading.userInfo ? (
              <div className="flex items-center gap-2 text-amber-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                <span className="text-sm">Loading your address information...</span>
              </div>
            ) : errors.userInfo ? (
              <div className="text-red-600 text-sm">
                {errors.userInfo}
                <button 
                  onClick={loadCurrentUserInfo}
                  className="ml-2 text-amber-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : currentUserInfo ? (
              <div>
                <div className="text-sm text-amber-700 mb-3 font-medium">
                  Current Saved Address:
                </div>
                <div className="space-y-2 text-sm text-amber-900">
                  <div><strong>Name:</strong> {currentUserInfoDetail.fullName}</div>
                  <div><strong>Phone:</strong> {currentUserInfoDetail.phone}</div>
                  <div><strong>Province:</strong> {currentUserInfoDetail.province}</div>
                  <div><strong>City:</strong> {currentUserInfoDetail.city}</div>
                  <div><strong>District:</strong> {currentUserInfoDetail.district}</div>
                  <div><strong>Village:</strong> {currentUserInfoDetail.village}</div>
                  <div><strong>Address:</strong> {currentUserInfoDetail.address}</div>
                </div>
                
                {(currentUserInfo.province === "Unknown" || 
                  currentUserInfo.city === "Unknown" ||
                  currentUserInfo.district === "Unknown" ||
                  currentUserInfo.village === "Unknown" ||
                  currentUserInfo.address === "Unknown") && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-l-4 border-amber-400 rounded-lg flex items-center gap-4 shadow-sm">
                    <div className="flex items-center justify-center bg-amber-100 rounded-full h-12 w-12">
                      <LuTriangleAlert className="text-amber-600" size={25} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <p className="text-sm text-yellow-800 font-medium">
                        Your profile is missing some address information. Please use the <span className="font-semibold">"Different Address"</span> option or update your profile.
                      </p>
                      <a href="/profile" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-md shadow transition-colors duration-150 w-fit">
                        Update Profile
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-amber-700 text-sm">
                No saved address information found. Please use "Different Address" option.
              </div>
            )}
          </div>
        )}

        {/* Manual address input form */}
        {!useCurrentInfo && (
          <div className="space-y-4">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.province}
                onChange={(e) => handleShippingChange("province", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white ${
                  getFieldError("province") ? "border-red-300" : "border-amber-200"
                }`}
                disabled={loading.provinces}
                required={!useCurrentInfo}
              >
                <option value="">
                  {loading.provinces ? "Loading provinces..." : "Select Province"}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.provinces && (
                <p className="text-red-500 text-xs mt-1">{errors.provinces}</p>
              )}
              {getFieldError("province") && (
                <p className="text-red-500 text-xs mt-1">Province is required</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                City/Regency <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.city}
                onChange={(e) => handleShippingChange("city", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white ${
                  getFieldError("city") ? "border-red-300" : "border-amber-200"
                }`}
                disabled={!shippingData.province || loading.cities}
                required={!useCurrentInfo}
              >
                <option value="">
                  {loading.cities ? "Loading cities..." : "Select City/Regency"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.cities && (
                <p className="text-red-500 text-xs mt-1">{errors.cities}</p>
              )}
              {getFieldError("city") && (
                <p className="text-red-500 text-xs mt-1">City/Regency is required</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.district}
                onChange={(e) => handleShippingChange("district", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white ${
                  getFieldError("district") ? "border-red-300" : "border-amber-200"
                }`}
                disabled={!shippingData.city || loading.districts}
                required={!useCurrentInfo}
              >
                <option value="">
                  {loading.districts ? "Loading districts..." : "Select District"}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.districts && (
                <p className="text-red-500 text-xs mt-1">{errors.districts}</p>
              )}
              {getFieldError("district") && (
                <p className="text-red-500 text-xs mt-1">District is required</p>
              )}
            </div>

            {/* Village */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Village <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.village}
                onChange={(e) => handleShippingChange("village", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white ${
                  getFieldError("village") ? "border-red-300" : "border-amber-200"
                }`}
                disabled={!shippingData.district || loading.villages}
                required={!useCurrentInfo}
              >
                <option value="">
                  {loading.villages ? "Loading villages..." : "Select Village"}
                </option>
                {villages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
              </select>
              {errors.villages && (
                <p className="text-red-500 text-xs mt-1">{errors.villages}</p>
              )}
              {getFieldError("village") && (
                <p className="text-red-500 text-xs mt-1">Village is required</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Detailed Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingData.address}
                onChange={(e) => handleShippingChange("address", e.target.value)}
                placeholder="Enter your complete address (street name, house number, landmarks, etc.)"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical ${
                  getFieldError("address") ? "border-red-300" : "border-amber-200"
                }`}
                required={!useCurrentInfo}
              />
              {getFieldError("address") && (
                <p className="text-red-500 text-xs mt-1">Detailed address is required</p>
              )}
            </div>

            {/* Validation warning */}
            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    Please fill in all shipping address fields to proceed with payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderShipping;