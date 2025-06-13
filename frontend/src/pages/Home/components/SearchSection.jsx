import React, { useState, useEffect } from "react";
import { Filter, ChevronDown, MapPin, X } from "lucide-react";
import SearchBar from "../../../components/SearchBar";
import {
  getProvincesService,
  getCitiesService,
  getDistrictsService,
  getVillagesService,
} from "../../../service/utilServices/utilService";

const LocationFilterButton = ({ onFiltersChange, userLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    province: "",
    city: "",
    district: "",
    village: "",
  });

  const [filterIds, setFilterIds] = useState({
    province: "",
    city: "",
    district: "",
    village: "",
    userInteracted: false,
  });

  const [locationData, setLocationData] = useState({
    provinces: [],
    cities: [],
    districts: [],
    villages: [],
  });

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (userLocation && userLocation.province && !isInitialized) {
      const newFilterIds = {
        province: userLocation.province,
        city: userLocation.city || "",
        district: userLocation.district || "",
        village: userLocation.village || "",
        userInteracted: false,
      };
      setFilterIds(newFilterIds);
      setIsInitialized(true);
      onFiltersChange && onFiltersChange(newFilterIds);
    }
  }, [userLocation, isInitialized, onFiltersChange]);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await getProvincesService();
        const provinces = response.data || [];
        setLocationData((prev) => ({
          ...prev,
          provinces,
        }));

        if (filterIds.province && provinces.length > 0) {
          const userProvince = provinces.find(
            (p) => p.id === filterIds.province
          );
          if (userProvince) {
            setFilters((prev) => ({
              ...prev,
              province: userProvince.name,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, [filterIds.province]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!filterIds.province) {
        setLocationData((prev) => ({
          ...prev,
          cities: [],
          districts: [],
          villages: [],
        }));
        return;
      }

      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        const response = await getCitiesService(filterIds.province);
        const cities = response.data || [];
        setLocationData((prev) => ({
          ...prev,
          cities,
          districts: [],
          villages: [],
        }));

        if (filterIds.city && cities.length > 0) {
          const userCity = cities.find((c) => c.id === filterIds.city);
          if (userCity) {
            setFilters((prev) => ({
              ...prev,
              city: userCity.name,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    fetchCities();
  }, [filterIds.province, filterIds.city]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!filterIds.city) {
        setLocationData((prev) => ({ ...prev, districts: [], villages: [] }));
        return;
      }

      setLoading((prev) => ({ ...prev, districts: true }));
      try {
        const response = await getDistrictsService(filterIds.city);
        const districts = response.data || [];
        setLocationData((prev) => ({
          ...prev,
          districts,
          villages: [],
        }));

        if (filterIds.district && districts.length > 0) {
          const userDistrict = districts.find(
            (d) => d.id === filterIds.district
          );
          if (userDistrict) {
            setFilters((prev) => ({
              ...prev,
              district: userDistrict.name,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };

    fetchDistricts();
  }, [filterIds.city, filterIds.district]);

  useEffect(() => {
    const fetchVillages = async () => {
      if (!filterIds.district) {
        setLocationData((prev) => ({ ...prev, villages: [] }));
        return;
      }

      setLoading((prev) => ({ ...prev, villages: true }));
      try {
        const response = await getVillagesService(filterIds.district);
        const villages = response.data || [];
        setLocationData((prev) => ({
          ...prev,
          villages,
        }));

        if (filterIds.village && villages.length > 0) {
          const userVillage = villages.find((v) => v.id === filterIds.village);
          if (userVillage) {
            setFilters((prev) => ({
              ...prev,
              village: userVillage.name,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching villages:", error);
      } finally {
        setLoading((prev) => ({ ...prev, villages: false }));
      }
    };

    fetchVillages();
  }, [filterIds.district, filterIds.village]);

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    const newFilterIds = { ...filterIds, userInteracted: true };

    let selectedItem = null;
    switch (type) {
      case "province":
        selectedItem = locationData.provinces.find(
          (item) => item.name === value
        );
        newFilterIds.province = selectedItem ? selectedItem.id : "";
        newFilters.city = "";
        newFilters.district = "";
        newFilters.village = "";
        newFilterIds.city = "";
        newFilterIds.district = "";
        newFilterIds.village = "";
        break;
      case "city":
        selectedItem = locationData.cities.find((item) => item.name === value);
        newFilterIds.city = selectedItem ? selectedItem.id : "";
        newFilters.district = "";
        newFilters.village = "";
        newFilterIds.district = "";
        newFilterIds.village = "";
        break;
      case "district":
        selectedItem = locationData.districts.find(
          (item) => item.name === value
        );
        newFilterIds.district = selectedItem ? selectedItem.id : "";
        newFilters.village = "";
        newFilterIds.village = "";
        break;
      case "village":
        selectedItem = locationData.villages.find(
          (item) => item.name === value
        );
        newFilterIds.village = selectedItem ? selectedItem.id : "";
        break;
    }

    setFilters(newFilters);
    setFilterIds(newFilterIds);

    onFiltersChange && onFiltersChange(newFilterIds);
  };

  const clearFilters = () => {
    const emptyFilters = { province: "", city: "", district: "", village: "" };
    const emptyFilterIds = {
      province: "",
      city: "",
      district: "",
      village: "",
      userInteracted: true,
    };
    setFilters(emptyFilters);
    setFilterIds(emptyFilterIds);
    onFiltersChange && onFiltersChange(emptyFilterIds);
  };

  const hasActiveFilters = Object.values(filterIds)
    .filter(
      (value, index, array) =>
        Object.keys(filterIds)[index] !== "userInteracted"
    )
    .some((value) => value !== "");

  const getPluralLabel = (label) => {
    switch (label.toLowerCase()) {
      case "city":
        return "Cities";
      case "province":
        return "Provinces";
      case "district":
        return "Districts";
      case "village":
        return "Villages";
      default:
        return `${label}s`;
    }
  };

  const getAvailableOptions = (type) => {
    switch (type) {
      case "province":
        return locationData.provinces;
      case "city":
        return locationData.cities;
      case "district":
        return locationData.districts;
      case "village":
        return locationData.villages;
      default:
        return [];
    }
  };

  const renderSelect = (type, label, disabled = false) => {
    const options = getAvailableOptions(type);
    const isLoading = loading[type];

    return (
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-1">
          {label}
        </label>
        <select
          value={filters[type]}
          onChange={(e) => handleFilterChange(type, e.target.value)}
          disabled={disabled || isLoading}
          className={`w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
            disabled || isLoading ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        >
          <option value="">
            {isLoading
              ? `Loading ${label.toLowerCase()}...`
              : `All ${getPluralLabel(label)}`}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
          ${
            hasActiveFilters
              ? "bg-amber-100 border-amber-400 text-amber-800"
              : "bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
          }
        `}
      >
        <Filter size={18} />
        <span className="font-medium">Filter</span>
        {hasActiveFilters && (
          <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
            {
              Object.values(filterIds).filter(
                (value, index, array) =>
                  Object.keys(filterIds)[index] !== "userInteracted" && value
              ).length
            }
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border-2 border-amber-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-amber-600" />
                <h3 className="font-semibold text-amber-800">
                  Filter by Location
                </h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 transition-colors"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {renderSelect("province", "Province")}
              {renderSelect("city", "City", !filterIds.province)}
              {renderSelect("district", "District", !filterIds.city)}
              {renderSelect("village", "Village", !filterIds.district)}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

const SearchSection = ({
  searchQuery,
  setSearchQuery,
  onFiltersChange,
  userLocation,
}) => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="flex items-center gap-2 w-full max-w-2xl">
        <div className="flex-1">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => {}}
            minPrice=""
            setMinPrice={() => {}}
            maxPrice=""
            setMaxPrice={() => {}}
            showFilterButton={false}
            placeholder="Search restaurants..."
          />
        </div>
        <LocationFilterButton
          onFiltersChange={onFiltersChange}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default SearchSection;
