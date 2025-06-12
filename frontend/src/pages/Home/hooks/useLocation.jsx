import { useState, useEffect, useCallback } from "react";
import {
  getProvinceService,
  getCityService,
  getDistrictService,
  getVillageService,
} from "../../../service/utilServices/utilService";

const locationCache = new Map();

const useLocation = (locationIds) => {
  const [fullAddress, setFullAddress] = useState("");
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
    async (locationIds, streetAddress) => {
      const { province_id, city_id, district_id, village_id } = locationIds;

      if (!province_id && !city_id && !district_id && !village_id) {
        return streetAddress || "";
      }

      setIsLoading(true);
      setError(null);

      try {
        const [provinceName, cityName, districtName, villageName] =
          await Promise.all([
            fetchLocationName(province_id, "province", getProvinceService),
            fetchLocationName(city_id, "city", getCityService),
            fetchLocationName(district_id, "district", getDistrictService),
            fetchLocationName(village_id, "village", getVillageService),
          ]);

        const addressParts = [];

        if (streetAddress) {
          addressParts.push(streetAddress);
        }

        if (villageName) {
          addressParts.push(`Kel. ${villageName}`);
        }

        if (districtName) {
          addressParts.push(`Kec. ${districtName}`);
        }

        if (cityName) {
          addressParts.push(cityName);
        }

        if (provinceName) {
          addressParts.push(provinceName);
        }

        return addressParts.join(", ");
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
      buildFullAddress(locationIds, locationIds.streetAddress).then(
        setFullAddress
      );
    }
  }, [locationIds, buildFullAddress]);

  return { fullAddress, isLoading, error };
};

export default useLocation;
