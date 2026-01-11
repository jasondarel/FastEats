/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaSave,
  FaChevronDown,
  FaGlobeAmericas,
  FaCity,
  FaBuilding,
  FaTree,
  FaHome,
} from "react-icons/fa";
import {
  getProvincesService,
  getDistrictsService,
  getCitiesService,
  getVillagesService,
} from "../../../service/utilServices/utilService";

const RestaurantDetailsForm = ({
  restaurantName,
  setRestaurantName,
  restaurantAddress,
  setRestaurantAddress,
  restaurantProvince,
  setRestaurantProvince,
  restaurantCity,
  setRestaurantCity,
  restaurantDistrict,
  setRestaurantDistrict,
  restaurantVillage,
  setRestaurantVillage,
  isChanged,
  onSubmit,
  initialRestaurantProvince,
  initialRestaurantCity,
  initialRestaurantDistrict,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await getProvincesService();
        setProvinces(response.data || []);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    const loadCities = async () => {
      if (restaurantProvince && restaurantProvince !== 'unknown') {
        setIsLoadingCities(true);
        try {
          const response = await getCitiesService(restaurantProvince);
          setCities(response.data || []);
          // Only reset child if province actually changed
          if (initialRestaurantProvince !== restaurantProvince) {
            setRestaurantCity("");
            setRestaurantDistrict("");
            setRestaurantVillage("");
          }
          setDistricts([]);
          setVillages([]);
        } catch (error) {
          console.error("Error loading cities:", error);
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setCities([]);
        setDistricts([]);
        setVillages([]);
      }
    };

    loadCities();
  }, [
    restaurantProvince,
    initialRestaurantProvince,
    setRestaurantCity,
    setRestaurantDistrict,
    setRestaurantVillage,
  ]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (restaurantCity && restaurantCity !== 'unknown') {
        setIsLoadingDistricts(true);
        try {
          const response = await getDistrictsService(restaurantCity);
          setDistricts(response.data || []);
          // Only reset child if city actually changed
          if (initialRestaurantCity !== restaurantCity) {
            setRestaurantDistrict("");
            setRestaurantVillage("");
          }
          setVillages([]);
        } catch (error) {
          console.error("Error loading districts:", error);
        } finally {
          setIsLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
        setVillages([]);
      }
    };

    loadDistricts();
  }, [
    restaurantCity,
    initialRestaurantCity,
    setRestaurantDistrict,
    setRestaurantVillage,
  ]);

  // Load villages when district changes
  useEffect(() => {
    const loadVillages = async () => {
      if (restaurantDistrict && restaurantDistrict !== 'unknown') {
        setIsLoadingVillages(true);
        try {
          const response = await getVillagesService(restaurantDistrict);
          setVillages(response.data || []);
          // Only reset child if district actually changed
          if (initialRestaurantDistrict !== restaurantDistrict) {
            setRestaurantVillage("");
          }
        } catch (error) {
          console.error("Error loading villages:", error);
        } finally {
          setIsLoadingVillages(false);
        }
      } else {
        setVillages([]);
      }
    };

    loadVillages();
  }, [restaurantDistrict, initialRestaurantDistrict, setRestaurantVillage]);

  // Custom Select Component
  const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    isLoading,
    disabled,
    icon,
  }) => (
    <div>
      <label className="block text-gray-700 font-semibold mb-2 text-sm">{label}</label>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
          {icon}
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className="w-full p-3 focus:outline-none appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-50 rounded-r-lg"
            required
          >
            <option value="">{isLoading ? "Loading..." : placeholder}</option>
            {options.map((option) => (
              <option
                key={option.id || option.value}
                value={option.id || option.value}
              >
                {option.name || option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="mr-3 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Restaurant Name */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-sm">
          Restaurant Name
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
          <FaUtensils className="ml-4 text-amber-500" />
          <input
            type="text"
            placeholder="Enter your restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
            className="w-full p-3 focus:outline-none rounded-r-lg"
          />
        </div>
      </div>

      {/* Location Grid - 2 columns */}
      <div>
        <h3 className="text-gray-800 font-semibold mb-3 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-amber-500" />
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            label="Province"
            value={restaurantProvince}
            onChange={setRestaurantProvince}
            options={provinces}
            placeholder="Select Province"
            isLoading={isLoadingProvinces}
            disabled={false}
            icon={<FaGlobeAmericas className="ml-3 text-amber-500" />}
          />

          <CustomSelect
            label="City"
            value={restaurantCity}
            onChange={setRestaurantCity}
            options={cities}
            placeholder="Select City"
            isLoading={isLoadingCities}
            disabled={!restaurantProvince}
            icon={<FaCity className="ml-3 text-amber-500" />}
          />

          <CustomSelect
            label="District"
            value={restaurantDistrict}
            onChange={setRestaurantDistrict}
            options={districts}
            placeholder="Select District"
            isLoading={isLoadingDistricts}
            disabled={!restaurantCity}
            icon={<FaBuilding className="ml-3 text-amber-500" />}
          />

          <CustomSelect
            label="Village"
            value={restaurantVillage}
            onChange={setRestaurantVillage}
            options={villages}
            placeholder="Select Village"
            isLoading={isLoadingVillages}
            disabled={!restaurantDistrict}
            icon={<FaTree className="ml-3 text-amber-500" />}
          />
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2 text-sm">
          Street Address
        </label>
        <div className="flex items-start border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
          <FaHome className="ml-4 mt-3 text-amber-500" />
          <textarea
            placeholder="Enter detailed street address (building number, street name, etc.)"
            value={restaurantAddress}
            onChange={(e) => setRestaurantAddress(e.target.value)}
            required
            className="w-full p-3 focus:outline-none resize-y min-h-[80px] rounded-r-lg"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={!isChanged}
          className={`w-full p-4 text-white text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center shadow-md ${
            isChanged
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg transform hover:scale-[1.02]"
              : "bg-gray-400 cursor-not-allowed opacity-60"
          }`}
        >
          <FaSave className="mr-2" /> 
          {isChanged ? "Update Restaurant" : "No Changes to Save"}
        </button>
      </div>
    </form>
  );
};

export default RestaurantDetailsForm;
