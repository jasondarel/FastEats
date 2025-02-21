import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MyMenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    menuName: "",
    menuDesc: "",
    menuPrice: "",
    menuCategory: "",
    menuImage: null,
  });
  const [menuImage, setMenuImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(
          `http://localhost:5000/restaurant/menu-by-id/${menuId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch menu details");
        }

        const data = await response.json();
        console.log("Fetched menu data:", data);

        if (data.menu) {
          setMenu(data.menu);
          console.log("Menu data:", data.menu);
          setFormData({
            menuName: data.menu.menu_name || "",
            menuDesc: data.menu.menu_description || "",
            menuPrice: data.menu.menu_price || "",
            menuImage: data.menu.menu_image || "",
            menuCategory: data.menu.menu_category || "",
          });
        } else {
          throw new Error(`Menu with ID ${menuId} not found`);
        }
      } catch (error) {
        console.error("Error details:", error);
        setError(
          error.message || "An error occurred while fetching menu details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      setMenuImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAvailability = async (available) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch(
        `http://localhost:5000/restaurant/update-available/${menuId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAvailable: !available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update menu availability");
      }

      const data = await response.json();
      setMenu((prevMenu) => ({
        ...prevMenu,
        is_available: !prevMenu.is_available,
      }));

      alert(data.message || "Menu availability updated successfully");
    } catch (error) {
      console.error("Error updating menu availability:", error);
      setError(error.message);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    console.log("Updating menu with data:", formData);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const formDataObj = new FormData();
      formDataObj.append("menuName", formData.menuName);
      formDataObj.append("menuDescription", formData.menuDesc);
      formDataObj.append("menuCategory", formData.menuCategory);
      formDataObj.append("menuPrice", formData.menuPrice);

      if (menuImage) {
        formDataObj.append("menuImage", menuImage);
      } else {
        formDataObj.append("menuImage", formData.menuImage
          ? formData.menuImage
          : null);
      }

      const response = await fetch(
        `http://localhost:5000/restaurant/menu/${menuId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataObj,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update menu");
      }

      const updateData = await response.json();
      setMenu(updateData.menu);
      setShowEditForm(false);
      alert("Menu updated successfully");
      window.location.reload();
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        console.log("Data: ", data);
        if (status === 400) {
          if (data.errors) {
            const validationErrors = Object.values(data.errors)
              .map((msg) => `• ${msg}`)
              .join("\n");
            alert(`Validation Error:\n${validationErrors}`);
          } else if (data.message) {
            alert(`Error: ${data.message}`);
          } else {
            alert("Invalid request. Please check your input.");
          }
        } else if (status === 401) {
          alert("Unauthorized! Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(
            data.message ||
              "An unexpected error occurred. Please try again later."
          );
        }
      }
    }
  };

  const handleDeleteMenu = async () => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch(
        `http://localhost:5000/restaurant/menu/${menuId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete menu");
      }

      alert("Menu deleted successfully");
      navigate("/my-menu");
    } catch (error) {
      console.error("Error deleting menu:", error);
      setError(error.message);
    }
  };

  if (loading)
    return (
      <div className="text-center p-5 text-lg font-semibold text-gray-700">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center p-5 text-lg font-semibold">
        {error}
      </div>
    );
  if (!menu)
    return (
      <div className="text-gray-500 text-center p-5 text-lg font-semibold">
        Menu not found.
      </div>
    );

  return (
    <div className="flex ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <main className="flex-1 p-5 relative">
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg border border-slate-300 rounded-xl mt-16">
          <button
            onClick={() => navigate("/my-menu")}
            className="absolute top-8 right-8 flex items-center justify-center w-12 h-12 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {menu.menu_name || "Unnamed Dish"}
              </h1>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    menu.is_available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {menu.is_available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleToggleAvailability(menu.is_available)}
                className={`px-4 py-2 rounded-md text-white transition-colors hover:cursor-pointer ${
                  menu.is_available
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Make {menu.is_available ? "Unavailable" : "Available"}
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
              <button
                onClick={handleDeleteMenu}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>

          <img
            src={
              menu.menu_image
                ? `http://localhost:5000/restaurant/uploads/${menu.menu_image}`
                : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
            }
            alt={menu.menu_name || "Menu item"}
            className="w-full h-64 object-contain rounded-lg shadow-md mb-4"
          />

          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <p className="text-sm uppercase tracking-wide font-semibold text-yellow-800 mb-2">
              Category: {menu.menu_category || "No category"}
            </p>
            <p className="text-2xl font-bold text-yellow-700">
              Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {menu.menu_description || "No description available."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Menu Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(menu.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(menu.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-700">
                Edit Menu Item
              </h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateMenu}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Image
                </label>
                <div className="border-2 border-dashed border-yellow-300 rounded-md p-4 text-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-h-64 mx-auto mb-2 object-contain"
                    />
                  ) : menu.menu_image ? (
                    <img
                      src={`http://localhost:5000/restaurant/uploads/${menu.menu_image}`}
                      alt={menu.menu_name}
                      className="max-h-64 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 mb-2">No image</div>
                  )}
                  <input
                    type="file"
                    id="menuImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="menuImage"
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded cursor-pointer hover:bg-yellow-200"
                  >
                    Choose New Image
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="menuName"
                  value={formData.menuName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="menuDesc"
                  value={formData.menuDesc}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rp)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="menuPrice"
                    value={formData.menuPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="menuCategory"
                    value={formData.menuCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Drink">Drink</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMenuDetails;
