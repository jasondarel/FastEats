/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUtensils, FaMapMarkerAlt, FaSave, FaChevronDown } from "react-icons/fa";
import { getProvincesService, getDistrictsService, getCitiesService, getVillagesService } from "../../../service/utilServices/utilService";

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
      if (restaurantProvince) {
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
  }, [restaurantProvince, initialRestaurantProvince, setRestaurantCity, setRestaurantDistrict, setRestaurantVillage]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (restaurantCity) {
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
  }, [restaurantCity, initialRestaurantCity, setRestaurantDistrict, setRestaurantVillage]);

  // Load villages when district changes
  useEffect(() => {
    const loadVillages = async () => {
      if (restaurantDistrict) {
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
  const CustomSelect = ({ label, value, onChange, options, placeholder, isLoading, disabled }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaMapMarkerAlt className="ml-3 text-gray-500" />
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className="w-full p-3 focus:outline-none appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
            required
          >
            <option value="">
              {isLoading ? "Loading..." : placeholder}
            </option>
            {options.map((option) => (
              <option key={option.id || option.value} value={option.id || option.value}>
                {option.name || option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="mr-3 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Restaurant Name
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaUtensils className="ml-3 text-gray-500" />
          <input
            type="text"
            placeholder="Enter your restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
            className="w-full p-3 focus:outline-none"
          />
        </div>
      </div>

      <CustomSelect
        label="Province"
        value={restaurantProvince}
        onChange={setRestaurantProvince}
        options={provinces}
        placeholder="Select Province"
        isLoading={isLoadingProvinces}
        disabled={false}
      />

      <CustomSelect
        label="City"
        value={restaurantCity}
        onChange={setRestaurantCity}
        options={cities}
        placeholder="Select City"
        isLoading={isLoadingCities}
        disabled={!restaurantProvince}
      />

      <CustomSelect
        label="District"
        value={restaurantDistrict}
        onChange={setRestaurantDistrict}
        options={districts}
        placeholder="Select District"
        isLoading={isLoadingDistricts}
        disabled={!restaurantCity}
      />

      <CustomSelect
        label="Village"
        value={restaurantVillage}
        onChange={setRestaurantVillage}
        options={villages}
        placeholder="Select Village"
        isLoading={isLoadingVillages}
        disabled={!restaurantDistrict}
      />

      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Restaurant Address
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaMapMarkerAlt className="ml-3 text-gray-500" />
          <textarea
            placeholder="Enter your restaurant address"
            value={restaurantAddress}
            onChange={(e) => setRestaurantAddress(e.target.value)}
            required
            className="w-full p-3 focus:outline-none resize-y min-h-[60px]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isChanged}
        className={`w-full p-3 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center ${
          isChanged
            ? "bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <FaSave className="mr-2" /> Update Restaurant
      </button>
    </form>
  );
};

export default RestaurantDetailsForm;