import { useState, useEffect } from "react";
import {
  getProvincesService,
  getCitiesService,
  getDistrictsService,
  getVillagesService,
} from "../../../service/utilServices/utilService";

const OrderShipping = () => {
  const [useCurrentInfo, setUseCurrentInfo] = useState(true);
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
  });

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    try {
      const response = await getProvincesService();
      setProvinces(response.data || []);
    } catch (error) {
      console.error("Error loading provinces:", error);
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
    try {
      const response = await getCitiesService(provinceId);
      setCities(response.data || []);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
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
    try {
      const response = await getDistrictsService(cityId);
      setDistricts(response.data || []);
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistricts([]);
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
    try {
      const response = await getVillagesService(districtId);
      setVillages(response.data || []);
    } catch (error) {
      console.error("Error loading villages:", error);
      setVillages([]);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
      loadCities(value);
    } else if (field === "city") {
      setShippingData((prev) => ({
        ...prev,
        district: "",
        village: "",
      }));
      setDistricts([]);
      setVillages([]);
      loadDistricts(value);
    } else if (field === "district") {
      setShippingData((prev) => ({
        ...prev,
        village: "",
      }));
      setVillages([]);
      loadVillages(value);
    }
  };
  return (
    <div>
      <div className="mt-8 p-6 bg-amber-50 rounded-lg">
        <h3 className="text-xl font-semibold text-amber-900 mb-4">
          Shipping Information
        </h3>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setUseCurrentInfo(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              useCurrentInfo
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Use Current Address
          </button>
          <button
            onClick={() => setUseCurrentInfo(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !useCurrentInfo
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Use Different Address
          </button>
        </div>

        {!useCurrentInfo && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.province}
                onChange={(e) =>
                  handleShippingChange("province", e.target.value)
                }
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                disabled={loading.provinces}
              >
                <option value="">
                  {loading.provinces
                    ? "Loading provinces..."
                    : "Select Province"}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                City/Regency <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.city}
                onChange={(e) => handleShippingChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                disabled={!shippingData.province || loading.cities}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.district}
                onChange={(e) =>
                  handleShippingChange("district", e.target.value)
                }
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                disabled={!shippingData.city || loading.districts}
              >
                <option value="">
                  {loading.districts
                    ? "Loading districts..."
                    : "Select District"}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Village <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingData.village}
                onChange={(e) =>
                  handleShippingChange("village", e.target.value)
                }
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                disabled={!shippingData.district || loading.villages}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Detailed Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingData.address}
                onChange={(e) =>
                  handleShippingChange("address", e.target.value)
                }
                placeholder="Enter your complete address (street name, house number, landmarks, etc.)"
                rows={4}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
              />
              <div className="text-xs text-amber-600 mt-1">
                Please provide complete address details for accurate delivery
              </div>
            </div>
          </div>
        )}

        {useCurrentInfo && (
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-sm text-amber-700 mb-2">
              Using your current saved address information
            </div>
            <div className="text-amber-900">
              <div className="text-sm opacity-75">
                Your default shipping address will be used for this order
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderShipping;
