/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateMenuService,
  deleteMenuService,
} from "../../service/restaurantService/updateMenuService";
import MenuForm from "./components/MenuForm";
import CategorySelector from "./components/CategorySelector";
import ImageUploader from "./components/ImageUploader";
import FormHeader from "./components/FormHeader";
import { ROOT_URL } from "../../config/api";

const UpdateMenu = () => {
  const { restaurantId } = useParams();
  const [error, setError] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (file) => {
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

      // Note: menuId is missing in the original code as well
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

        // Note: menuId is missing in the original code as well
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
          <FormHeader
            title="Update Menu Form"
            backLink={`${ROOT_URL}/my-menu`}
          />

          <div className="border border-yellow-200 p-4 bg-slate-100 rounded-md">
            <form className="text-start" onSubmit={handleUpdateMenu}>
              <ImageUploader
                previewImage={previewImage}
                onImageChange={handleImageChange}
              />

              <MenuForm
                menuName={menuName}
                setMenuName={setMenuName}
                menuDesc={menuDesc}
                setMenuDesc={setMenuDesc}
                menuPrice={menuPrice}
                setMenuPrice={setMenuPrice}
              />

              <CategorySelector
                selectedCategory={selectedCategory}
                onCategorySelect={(category) => setSelectedCategory(category)}
              />

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
