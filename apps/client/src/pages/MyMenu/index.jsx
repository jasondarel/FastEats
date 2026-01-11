import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import createNewMenuService from "../../service/restaurantService/myMenuService";
import Swal from "sweetalert2";
import SearchBar from "../../components/SearchBar";
import BackButton from "../../components/BackButton";
import MenuItemCard from "./components/MenuItemCard";
import CreateMenuForm from "./components/CreateMenuForm";
import CategoryFilter from "../../components/CategoryFilter";
import AlphabetSort from "../../components/AlphabetSort";
import LoadingState from "../../components/LoadingState";
import { handleApiError } from "./components/HandleAlert";
import { API_URL } from "../../config/api";

const MyMenuPage = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateMenuForm, setShowCreateMenuForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");

  const navigate = useNavigate();

  const handleMenuItemClick = (menuId) => {
    navigate(`/my-menu/${menuId}/details`);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(`${API_URL}/restaurant/menus`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch menu.");
        }

        const data = await response.json();
        setMenuItems(data.menus || []);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  const handleCreateMenuSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      formData.append("restaurantId", restaurantId);

      const response = await createNewMenuService(formData, token);

      setMenuItems((prevItems) => [...prevItems, response.data.dataMenu]);
      setShowCreateMenuForm(false);

      Swal.fire({
        title: "Success!",
        text: "Menu created successfully",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } catch (error) {
      handleApiError(error, navigate);
    }
  };

  const filteredAndSortedMenu = menuItems
    .filter((item) => {
      const matchesSearch = item.menu_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "All" ? true : item.menu_category === filterCategory;
      const price = parseInt(item.menu_price);
      let matchesPrice = true;
      if (minPrice && price < parseInt(minPrice)) matchesPrice = false;
      if (maxPrice && price > parseInt(maxPrice)) matchesPrice = false;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      return sortOption === "nameAsc"
        ? a.menu_name.localeCompare(b.menu_name)
        : b.menu_name.localeCompare(a.menu_name);
    });

  // Replace the previous loading state with LoadingState component
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex ml-0 lg:ml-64 bg-white min-h-screen">
      <Sidebar />
      <BackButton to="/manage-restaurant" />
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">My Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 lg:gap-0 items-center justify-center mb-6">
          <div className="flex-grow max-w-2xl flex justify-center right-0 mr-5">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              placeholder="Search menu items..."
            />
          </div>

          <AlphabetSort sortOption={sortOption} setSortOption={setSortOption} />
        </div>

        <CategoryFilter
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

        {filteredAndSortedMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedMenu.map((item) => (
              <MenuItemCard
                key={item.menu_id}
                item={item}
                onClick={() => handleMenuItemClick(item.menu_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            {searchQuery || filterCategory !== "All" || minPrice || maxPrice
              ? "No menu items match your search criteria."
              : "No menu available."}
          </div>
        )}

        <button
          onClick={() => setShowCreateMenuForm(true)}
          className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 hover:cursor-pointer"
        >
          + Add Menu
        </button>

        {showCreateMenuForm && (
          <CreateMenuForm
            onClose={() => setShowCreateMenuForm(false)}
            onSubmit={handleCreateMenuSubmit}
          />
        )}
      </main>
    </div>
  );
};

export default MyMenuPage;
