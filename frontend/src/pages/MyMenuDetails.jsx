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

        // Use menu-by-id endpoint instead of menu
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

        // Expect a single menu object in the response
        if (data.menu) {
          setMenu(data.menu);
          setFormData({
            menuName: data.menu.menu_name || "",
            menuDesc: data.menu.menu_description || "",
            menuPrice: data.menu.menu_price || "",
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

  const handleUpdateMenu = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const formDataObj = new FormData();
      formDataObj.append("menuName", formData.menuName);
      formDataObj.append("menuDesc", formData.menuDesc);
      formDataObj.append("menuCategory", formData.menuCategory);
      formDataObj.append("menuPrice", formData.menuPrice);

      if (menuImage) {
        formDataObj.append("menuImage", menuImage);
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
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-16">
          <Link
            to="/my-menu"
            className="text-yellow-600 hover:text-yellow-700 hover:underline flex items-center mb-4"
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
                d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z"
              />
            </svg>
            <span className="ml-2">Back to My Menu</span>
          </Link>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              {menu.menu_name || "Unnamed Dish"}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteMenu}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
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
            className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
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
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Menu ID</p>
                <p className="font-medium">{menu.menu_id}</p>
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
