import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import BackButton from "../../components/BackButton";
import MenuHeader from "./components/MenuHeader";
import MenuImage from "./components/MenuImage";
import MenuInfo from "./components/MenuInfo";
import MenuStats from "./components/MenuStats";
import EditMenuForm from "./components/EditMenuForm";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LoadingState from "../../components/LoadingState";
import { API_URL } from "../../config/api";

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
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(
          `${API_URL}/restaurant/menu-by-id/${menuId}`,
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

        if (data.menu) {
          setMenu(data.menu);
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
        `${API_URL}/restaurant/update-available/${menuId}`,
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

      Swal.fire({
        title: "Success!",
        text: data.message || "Menu availability updated successfully",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });

      setMenu((prevMenu) => ({
        ...prevMenu,
        is_available: !prevMenu.is_available,
      }));
    } catch (error) {
      console.error("Error updating menu availability:", error);
      setError(error.message);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
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
        formDataObj.append(
          "menuImage",
          formData.menuImage ? formData.menuImage : null
        );
      }

      const response = await fetch(
        `${API_URL}/restaurant/menu/${menuId}`,
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
      MySwal.fire({
        title: "Menu Updated!",
        text: "Menu updated successfully",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          setMenu(updateData.menu);
          setShowEditForm(false);
          window.location.reload();
        }
      });
    } catch (error) {
      handleUpdateError(error);
    }
  };

  const handleUpdateError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) {
        if (data.errors) {
          const validationErrors = Object.values(data.errors)
            .map((msg) => `• ${msg}`)
            .join("\n");
          MySwal.fire({
            title: "Validation Error",
            text: `Please check the following errors:\n${validationErrors}`,
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#efb100",
          });
        } else if (data.message) {
          MySwal.fire({
            title: "Error",
            text: data.message,
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#efb100",
          });
        } else {
          MySwal.fire({
            title: "Error",
            text: "Invalid request. Please check your input.",
            icon: "error",
            confirmButtonText: "Ok",
            confirmButtonColor: "#efb100",
          });
        }
      } else if (status === 401) {
        MySwal.fire({
          title: "Unauthorized!",
          text: "Please log in again.",
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        });
      } else {
        MySwal.fire({
          title: "Error",
          text:
            data.message ||
            "An unexpected error occurred. Please try again later.",
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });
      }
    } else {
      MySwal.fire({
        title: "Error",
        text: error.message || "An unexpected error occurred",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });
    }
  };

  const handleDeleteMenu = async () => {
    if (menu.is_available) {
      MySwal.fire(
        "Error",
        "You cannot delete a menu item that is currently available.",
        "error"
      );
      return;
    }

    const confirmation = await MySwal.fire({
      title: "Confirm deletion",
      text: "Are you sure you want to delete this menu item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch(
        `${API_URL}/restaurant/menu/${menuId}`,
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

      MySwal.fire("Deleted!", "Menu deleted successfully", "success");
      navigate("/my-menu");
    } catch (error) {
      console.error("Error deleting menu:", error);
      setError(error.message);
    }
  };

  if (loading) return <LoadingState />;
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
  <div className="flex ml-0 lg:ml-64 bg-white min-h-screen">
    <Sidebar />
    <BackButton to="/my-menu" />
    <main className="flex-1 p-5 relative mt-20 ml-10">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg border border-slate-300 rounded-xl">
       
        <MenuHeader
          menu={menu}
          onToggleAvailability={handleToggleAvailability}
          onShowEditForm={() => setShowEditForm(true)}
          onDeleteMenu={handleDeleteMenu}
        />

        <MenuImage menu={menu} />

        <MenuInfo menu={menu} />

        <MenuStats menu={menu} />
      </div>
    </main>

    <EditMenuForm
      showEditForm={showEditForm}
      setShowEditForm={setShowEditForm}
      formData={formData}
      handleInputChange={handleInputChange}
      handleImageChange={handleImageChange}
      handleUpdateMenu={handleUpdateMenu}
      previewImage={previewImage}
      menu={menu}
    />
  </div>
);

};

export default MyMenuDetails;
