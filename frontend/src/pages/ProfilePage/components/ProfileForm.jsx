/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUser, FaMapMarkerAlt, FaPhone, FaChevronDown } from "react-icons/fa";
import { saveProfileService } from "../../../service/userServices/profileService";
import Swal from "sweetalert2";
import {
  getProvincesService,
  getCitiesService,
  getDistrictsService,
  getVillagesService,
} from "../../../service/utilServices/utilService";

const ProfileForm = ({
  profile,
  handleChange,
  isProfileChanged,
  preview,
  updateOriginalProfile,
  setProfile,
}) => {
  // Dropdown state
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Load provinces on mount
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
    if (profile.province) {
      setIsLoadingCities(true);
      getCitiesService(profile.province)
        .then((response) => {
          setCities(response.data || []);
        })
        .catch((error) => {
          console.error("Error loading cities:", error);
        })
        .finally(() => {
          setIsLoadingCities(false);
        });
    } else {
      setCities([]);
      setDistricts([]);
      setVillages([]);
    }
  }, [profile.province]);

  // Load districts when city changes
  useEffect(() => {
    if (profile.city) {
      setIsLoadingDistricts(true);
      getDistrictsService(profile.city)
        .then((response) => {
          setDistricts(response.data || []);
        })
        .catch((error) => {
          console.error("Error loading districts:", error);
        })
        .finally(() => {
          setIsLoadingDistricts(false);
        });
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [profile.city]);

  // Load villages when district changes
  useEffect(() => {
    if (profile.district) {
      setIsLoadingVillages(true);
      getVillagesService(profile.district)
        .then((response) => {
          setVillages(response.data || []);
        })
        .catch((error) => {
          console.error("Error loading villages:", error);
        })
        .finally(() => {
          setIsLoadingVillages(false);
        });
    } else {
      setVillages([]);
    }
  }, [profile.district]);

  // Custom select component
  const CustomSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    isLoading,
    disabled,
  }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaMapMarkerAlt className="ml-3 text-gray-500" />
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled || isLoading}
            className="w-full p-3 focus:outline-none appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
            required
          >
            <option value="">
              {isLoading ? "Loading..." : placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.id || option.value}
                value={option.id || option.value}
              >
                {option.name || option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="mr-3 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await saveProfileService(profile, preview, token);

      Swal.fire({
        title: "Success!",
        text: "Successfully updated profile",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          updateOriginalProfile();
        }
      });
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        icon={<FaUser className="ml-3 text-gray-500" />}
        type="text"
        name="name"
        placeholder="Name"
        value={profile.name}
        onChange={handleChange}
      />
      <InputField
        icon={<FaMapMarkerAlt className="ml-3 text-gray-500" />}
        type="text"
        name="address"
        placeholder="Address"
        value={profile.address}
        onChange={handleChange}
      />
      <InputField
        icon={<FaPhone className="ml-3 text-gray-500" />}
        type="text"
        name="phone_number"
        placeholder="Phone Number"
        value={profile.phone_number}
        onChange={handleChange}
      />
      <CustomSelect
        label="Province"
        name="province"
        value={profile.province}
        onChange={handleChange}
        options={provinces}
        placeholder="Select Province"
        isLoading={isLoadingProvinces}
        disabled={false}
      />
      <CustomSelect
        label="City"
        name="city"
        value={profile.city}
        onChange={handleChange}
        options={cities}
        placeholder="Select City"
        isLoading={isLoadingCities}
        disabled={!profile.province}
      />
      <CustomSelect
        label="District"
        name="district"
        value={profile.district}
        onChange={handleChange}
        options={districts}
        placeholder="Select District"
        isLoading={isLoadingDistricts}
        disabled={!profile.city}
      />
      <CustomSelect
        label="Village"
        name="village"
        value={profile.village}
        onChange={handleChange}
        options={villages}
        placeholder="Select Village"
        isLoading={isLoadingVillages}
        disabled={!profile.district}
      />
      <button
        type="submit"
        disabled={!isProfileChanged}
        className={`w-full p-3 rounded-lg transition font-semibold lg:font-bold lg:text-xl ${
          isProfileChanged
            ? "bg-yellow-500 text-white hover:bg-yellow-600 hover:cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Save Profile
      </button>
    </form>
  );
};

const InputField = ({ icon, type, name, placeholder, value, onChange }) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
      {icon}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 focus:outline-none"
      />
    </div>
  );
};

export default ProfileForm;
