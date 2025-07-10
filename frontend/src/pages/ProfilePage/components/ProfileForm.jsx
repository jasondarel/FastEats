/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaChevronDown,
  FaGlobeAmericas,
  FaCity,
  FaBuilding,
  FaTree,
  FaHome,
} from "react-icons/fa";
import { saveProfileService } from "../../../service/userServices/profileService";
import Swal from "sweetalert2";
import {
  getProvincesService,
  getCitiesService,
  getDistrictsService,
  getVillagesService,
} from "../../../service/utilServices/utilService";
import { useSelector } from "react-redux";

const ProfileForm = ({
  profile,
  handleChange,
  isProfileChanged,
  preview,
  updateOriginalProfile,
  setProfile,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

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

  const CustomSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    isLoading,
    disabled,
    icon,
    required = true,
    backgroundColor = "bg-white",
  }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <div className={`flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500 ${backgroundColor}`}>
          {icon}
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled || isLoading}
            className="w-full p-3 focus:outline-none appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
            required={required}
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
      const errors = error.response.data.errors || {
        general: "An error occurred",
      };
      const firstError = Object.values(errors);
      if (firstError) {
        Swal.fire({
          title: "Error",
          text: firstError,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Name"
        icon={<FaUser className="ml-3 text-gray-500" />}
        type="text"
        name="name"
        placeholder="Name"
        value={profile.name}
        onChange={handleChange}
      />

      <InputField
        label="Phone Number"
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
        disabled={user.role === "seller" ? true : false}
        required={user.role === "seller" ? false : true}
        backgroundColor={user.role === "seller" ? "bg-gray-200" : "bg-white"}
        icon={<FaGlobeAmericas className="ml-3 text-gray-500" />}
      />
      <CustomSelect
        label="City"
        name="city"
        value={profile.city}
        onChange={handleChange}
        options={cities}
        placeholder="Select City"
        isLoading={isLoadingCities}
        disabled={!profile.province || user.role === "seller" ? true : false}
        required={user.role === "seller" ? false : true}
        backgroundColor={user.role === "seller" ? "bg-gray-200" : "bg-white"}
        icon={<FaCity className="ml-3 text-gray-500" />}
      />
      <CustomSelect
        label="District"
        name="district"
        value={profile.district}
        onChange={handleChange}
        options={districts}
        placeholder="Select District"
        isLoading={isLoadingDistricts}
        disabled={!profile.city || user.role === "seller" ? true : false}
        required={user.role === "seller" ? false : true}
        backgroundColor={user.role === "seller" ? "bg-gray-200" : "bg-white"}
        icon={<FaBuilding className="ml-3 text-gray-500" />}
      />
      <CustomSelect
        label="Village"
        name="village"
        value={profile.village}
        onChange={handleChange}
        options={villages}
        placeholder="Select Village"
        isLoading={isLoadingVillages}
        disabled={!profile.district || user.role === "seller" ? true : false}
        required={user.role === "seller" ? false : true}
        backgroundColor={user.role === "seller" ? "bg-gray-200" : "bg-white"}
        icon={<FaTree className="ml-3 text-gray-500" />}
      />
      <InputField
        label="Address Detail"
        icon={<FaHome className="ml-3 text-gray-500" />}
        type="text"
        name="address"
        placeholder="Address Detail"
        value={profile.address}
        onChange={handleChange}
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

const InputField = ({
  label,
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
      )}
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
    </div>
  );
};

export default ProfileForm;
