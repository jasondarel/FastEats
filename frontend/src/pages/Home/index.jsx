import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Carousel from "./components/Carousel";
import LoadingState from "../../components/LoadingState";
import ErrorAlert from "./components/ErrorAlert";
import WelcomeHeader from "./components/WelcomeHeader";
import RestaurantGrid from "./components/RestaurantGrid";
import SearchSection from "./components/SearchSection";
import { getRestaurants } from "../../service/restaurantService/manageRestaurantService";

const Home = () => {
  const [username, setUsername] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  const bannerImages = [
    "/bannerMain.png",
    "/banner1.png",
    "/banner2.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTatLiJAG6jse2XTu96VcidI8X5OYIvWzcenw&s",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user profile. Status: ${response.status}`
          );
        }

        const data = await response.json();
        setUserLocation({
          province: data.user?.province || 'unknown',
          city: data.user?.city || 'unknown',
          district: data.user?.district || 'unknown',
          village: data.user?.village || 'unknown',
        });
        setUsername(data.user?.name || "Guest");
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const response = await getRestaurants({...userLocation}, token);
        const data = response.data;
        console.log("Fetched restaurants:", data.restaurants);

        const openRestaurants = data.restaurants.filter(
          (restaurant) => restaurant.is_open
        );

        setRestaurants(openRestaurants);
        setFilteredRestaurants(openRestaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError(error.message);
      }
    };
    fetchRestaurants();
  }, [userLocation])

  // Update filtered restaurants whenever search query changes
  useEffect(() => {
    const filtered = restaurants.filter((restaurant) =>
      restaurant.restaurant_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

  // Handle restaurant click
  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}/menu`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col md:flex-row bg-yellow-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-5 lg:ml-64">
        <Carousel images={bannerImages} intervalTime={3000} />

        <WelcomeHeader username={username} />

        <ErrorAlert message={error} />

        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <RestaurantGrid
          restaurants={filteredRestaurants}
          onRestaurantClick={handleRestaurantClick}
        />
      </main>
    </div>
  );
};

export default Home;
