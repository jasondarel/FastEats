import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  updateMenuService,
  deleteMenuService,
} from "../../service/restaurantServices/updateMenuService";

const UpdateMenu = () => {
  const { restaurantId } = useParams();
  const [error, setError] = useState(null);

  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const navigate = useNavigate();
  const [menuPrice, setMenuPrice] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  //icons
  const foodIcon = "/icons/foods-icon.png";
  const drinkIcon = "/icons/drinks-icon.png";
  const dessertIcon = "/icons/dessert-icon.png";
  const otherIcon = "/icons/other-icon.png";

  const handleClick = (category) => {
    setSelectedCategory(category);
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

      const formData = new FormData();
      formData.append("menuName", menuName);
      formData.append("menuDesc", menuDesc);
      formData.append("menuCategory", selectedCategory);
      formData.append("menuPrice", menuPrice);
      formData.append("restaurantId", restaurantId);
      if (menuImage) {
        formData.append("menuImage", menuImage);
      }

      const response = updateMenuService(menuId, formData, token);

      alert("Menu updated successfully");
      navigate("/my-menu");
    } catch (error) {
      console.error(
        "Error updating menu:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  const handleDeleteMenu = async () => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in.");

        const response = await deleteMenuService(menuId, token);

        alert("Menu deleted successfully");
        navigate("/my-menu");
      } catch (error) {
        console.error(
          "Error deleting menu:",
          error.response?.data?.message || error.message
        );
        setError(error.response?.data?.message || "An error occurred");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center fixed top-0 right-0 bottom-0 left-0 z-50">
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-800 via-yellow-500 py-5 px-8 scale-90 rounded-md relative max-h-screen overflow-y-auto sm:min-w-lg sm:scale-[0.8] lg:min-w-xl lg:scale-95 xl:min-w-3xl">
          <div className="flex items-center justify-center relative">
            <h2 className="font-extrabold text-2xl my-5 -mt-2 text-center text-yellow-900 sm:text-4xl">
              Update Menu Form
              <div className="absolute -top-1.5 -right-4">
                <a
                  href="http://localhost:5173/my-menu"
                  className="text-2xl cursor-pointer"
                >
                  ❌
                </a>
              </div>
            </h2>
          </div>
          <div className="border border-yellow-200 p-4 bg-slate-100 rounded-md">
            <form className="text-start" onSubmit={handleUpdateMenu}>
              <div className="mb-4">
                <label className="font-semibold text-sm">
                  Update Image<span className="text-pink-600">*</span>
                </label>
                <div className="border border-slate-400 rounded-md border-dashed mt-1 w-full min-h-50 flex flex-col items-center justify-center">
                  <p className="font-semibold text-slate-600 text-center my-2">
                    JPG, PNG, GIF, WEBP, Max 100mb.
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-yellow-500 text-white p-2 cursor-pointer hover:bg-yellow-600 rounded-sm font-semibold"
                  >
                    Choose File
                  </label>
                  {previewImage && (
                    <div className="mt-2 flex justify-center w-full">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-80 object-contain rounded-md"
                        style={{ minWidth: "100%" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Input Name */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Update Name<span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                  placeholder="Your Menu's Name"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>

              {/* Input Description */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Update Description<span className="text-pink-600">*</span>
                </label>
                <textarea
                  className="input mt-1 border border-slate-400 rounded-md p-2 w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                  placeholder="Your Menu's Description"
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                />
              </div>

              {/* Input price */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Update Price<span className="text-pink-600">*</span>
                </label>
                <input
                  type="number"
                  className="input border mt-1 border-slate-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-0"
                  placeholder="Your Menu's Price"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                />
              </div>

              {/* Menu Category */}
              <div className="my-4">
                <label className="font-semibold text-sm">
                  Change Category<span className="text-pink-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-0 mt-1 md:grid-cols-4">
                  <div
                    className={`border border-yellow-400 rounded-tl-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-l ${
                      selectedCategory === "Food"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Food")}
                  >
                    <img
                      src={foodIcon}
                      alt="Foods"
                      className="mb-2 h-10 w-10 object-contain"
                    />
                    Foods
                  </div>

                  {/* Kategori Drinks */}
                  <div
                    className={`border rounded-tr-md border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-none ${
                      selectedCategory === "Drink"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Drink")}
                  >
                    <img
                      src={drinkIcon}
                      alt="Drinks"
                      className="mb-2 h-10 w-10 object-contain"
                    />
                    Drinks
                  </div>

                  {/* Kategori Dessert */}
                  <div
                    className={`border rounded-bl-md border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-none ${
                      selectedCategory === "Dessert"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Dessert")}
                  >
                    <img
                      src={dessertIcon}
                      alt="Dessert"
                      className="mb-2 h-10 w-10 object-contain"
                    />
                    Dessert
                  </div>

                  {/* Kategori Other */}
                  <div
                    className={`border border-yellow-400 rounded-br-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-r ${
                      selectedCategory === "Others"
                        ? "bg-yellow-500"
                        : "hover:bg-yellow-400"
                    }`}
                    onClick={() => handleClick("Others")}
                  >
                    <img
                      src={otherIcon}
                      alt="Other"
                      className="mb-2 h-10 w-10 object-contain"
                    />
                    Other
                  </div>
                </div>
              </div>

              {/* Submit Buttons - Modified to have Update and Delete */}
              <div className="mt-10 flex items-center justify-center w-full gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-tl from-green-400 via-green-500 to-green-700 text-white p-2.5 rounded-xl text-xl font-semibold cursor-pointer w-full"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateMenu;
