import React, { useState, useEffect, useCallback } from "react";
import {
  FaMapMarkerAlt,
  FaGlobeAsia,
  FaCity,
  FaBuilding,
  FaHome,
  FaAddressCard,
} from "react-icons/fa";
import {
  getCitiesService,
  getDistrictsService,
  getProvincesService,
  getVillagesService,
} from "../../../service/userServices/registerService";

const AddressForm = ({ profile, handleChange, onAddressChange }) => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  useEffect(() => {
    if (profile.address) {
      setDetailedAddress(profile.address);
    }
  }, [profile.address]);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await getProvincesService();
        setProvinces(response || []);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setProvinces([]);
      } finally {
        setLoadingStates((prev) => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  const fetchCities = useCallback(async (provinceId) => {
    if (!provinceId) {
      setAvailableCities([]);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, cities: true }));
    try {
      const response = await getCitiesService(provinceId);
      setAvailableCities(response || []);
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      setAvailableCities([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, cities: false }));
    }
  }, []);

  const fetchDistricts = useCallback(async (cityId) => {
    if (!cityId) {
      setAvailableDistricts([]);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, districts: true }));
    try {
      const response = await getDistrictsService(cityId);
      setAvailableDistricts(response || []);
    } catch (error) {
      console.error(`Error fetching districts for city ${cityId}:`, error);
      setAvailableDistricts([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, districts: false }));
    }
  }, []);

  const fetchVillages = useCallback(async (districtId) => {
    if (!districtId) {
      setAvailableVillages([]);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, villages: true }));
    try {
      const response = await getVillagesService(districtId);
      setAvailableVillages(response || []);
    } catch (error) {
      console.error(
        `Error fetching villages for district ${districtId}:`,
        error
      );
      setAvailableVillages([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, villages: false }));
    }
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchCities(selectedProvince);
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedVillage("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    } else {
      setAvailableCities([]);
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedVillage("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    }
  }, [selectedProvince, fetchCities]);

  useEffect(() => {
    if (selectedCity) {
      fetchDistricts(selectedCity);
      setSelectedDistrict("");
      setSelectedVillage("");
      setAvailableVillages([]);
    } else {
      setAvailableDistricts([]);
      setSelectedDistrict("");
      setSelectedVillage("");
      setAvailableVillages([]);
    }
  }, [selectedCity, fetchDistricts]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchVillages(selectedDistrict);
      setSelectedVillage("");
    } else {
      setAvailableVillages([]);
      setSelectedVillage("");
    }
  }, [selectedDistrict, fetchVillages]);

  useEffect(() => {
    if (
      selectedProvince &&
      selectedCity &&
      selectedDistrict &&
      selectedVillage &&
      detailedAddress
    ) {
      const selectedProvinceObj = provinces.find(
        (p) => p.id === selectedProvince
      );
      const selectedCityObj = availableCities.find(
        (c) => c.id === selectedCity
      );
      const selectedDistrictObj = availableDistricts.find(
        (d) => d.id === selectedDistrict
      );
      const selectedVillageObj = availableVillages.find(
        (v) => v.id === selectedVillage
      );

      const fullAddress = `${detailedAddress}, ${
        selectedVillageObj?.name || ""
      }, ${selectedDistrictObj?.name || ""}, ${selectedCityObj?.name || ""}, ${
        selectedProvinceObj?.name || ""
      }`;

      onAddressChange(fullAddress);
    }
  }, [
    selectedProvince,
    selectedCity,
    selectedDistrict,
    selectedVillage,
    detailedAddress,
    provinces,
    availableCities,
    availableDistricts,
    availableVillages,
    onAddressChange,
  ]);

  const renderSelectField = (
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    loading = false,
    icon = null
  ) => (
    <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
      {icon}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className="w-full p-3 focus:outline-none bg-white disabled:bg-gray-100"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Province */}
      {renderSelectField(
        selectedProvince,
        (e) => setSelectedProvince(e.target.value),
        provinces,
        "Select Province",
        false,
        loadingStates.provinces,
        <FaGlobeAsia className="ml-3 text-gray-500" />
      )}

      {/* City */}
      {renderSelectField(
        selectedCity,
        (e) => setSelectedCity(e.target.value),
        availableCities,
        "Select City/Regency",
        !selectedProvince,
        loadingStates.cities,
        <FaCity className="ml-3 text-gray-500" />
      )}

      {/* District */}
      {renderSelectField(
        selectedDistrict,
        (e) => setSelectedDistrict(e.target.value),
        availableDistricts,
        "Select District",
        !selectedCity,
        loadingStates.districts,
        <FaBuilding className="ml-3 text-gray-500" />
      )}

      {/* Village */}
      {renderSelectField(
        selectedVillage,
        (e) => setSelectedVillage(e.target.value),
        availableVillages,
        "Select Village",
        !selectedDistrict,
        loadingStates.villages,
        <FaHome className="ml-3 text-gray-500" />
      )}

      {/* Detailed Address */}
      <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
        <FaAddressCard className="ml-3 text-gray-500" />
        <textarea
          placeholder="Detailed Address (Street, House Number, etc.)"
          value={detailedAddress}
          onChange={(e) => setDetailedAddress(e.target.value)}
          rows={3}
          className="w-full p-3 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

export default AddressForm;
