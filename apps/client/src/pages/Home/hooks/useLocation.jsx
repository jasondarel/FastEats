import { useState, useEffect, useCallback } from "react";
import {
  getProvinceService,
  getCityService,
  getDistrictService,
  getVillageService,
} from "../../../service/utilServices/utilService";

const locationCache = new Map();

const useLocation = (locationIds, showAll = false) => {
  const [fullAddress, setFullAddress] = useState("");
  const [expandedAddress, setExpandedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocationName = useCallback(async (id, type, service) => {
    if (!id) return null;

    const cacheKey = `${type}-${id}`;

    if (locationCache.has(cacheKey)) {
      return locationCache.get(cacheKey);
    }

    try {
      const response = await service(id);
      const name = response.data.name;
      locationCache.set(cacheKey, name);
      return name;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return null;
    }
  }, []);

  const buildFullAddress = useCallback(
    async (locationIds, streetAddress, includeAll = false) => {
      const { province_id, city_id, district_id, village_id } = locationIds;

      if (!province_id && !city_id && !district_id && !village_id) {
        return streetAddress || "";
      }

      setIsLoading(true);
      setError(null);

      try {
        const promises = [
          fetchLocationName(province_id, "province", getProvinceService),
          fetchLocationName(city_id, "city", getCityService),
        ];

        if (includeAll) {
          promises.push(
            fetchLocationName(district_id, "district", getDistrictService),
            fetchLocationName(village_id, "village", getVillageService)
          );
        }

        const results = await Promise.all(promises);
        const [provinceName, cityName, districtName, villageName] = results;

        const addressParts = [];

        if (provinceName) {
          addressParts.push(provinceName);
        }

        if (cityName) {
          addressParts.push(cityName);
        }

        if (includeAll) {
          if (districtName) {
            addressParts.push(`Kec. ${districtName}`);
          }

          if (villageName) {
            addressParts.push(`Kel. ${villageName}`);
          }
        }

        if (streetAddress) {
          addressParts.push(streetAddress);
        }

        return addressParts.join("\n");
      } catch (error) {
        console.error("Error building full address:", error);
        setError(error.message);
        return streetAddress || "Address not available";
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLocationName]
  );

  useEffect(() => {
    if (locationIds) {
      // Build basic address (province, city, street)
      buildFullAddress(locationIds, locationIds.streetAddress, false).then(
        setFullAddress
      );

      // Build expanded address (all details)
      buildFullAddress(locationIds, locationIds.streetAddress, true).then(
        setExpandedAddress
      );
    }
  }, [locationIds, buildFullAddress]);

  return {
    fullAddress,
    expandedAddress,
    isLoading,
    error,
    currentAddress: showAll ? expandedAddress : fullAddress,
  };
};

export default useLocation;
