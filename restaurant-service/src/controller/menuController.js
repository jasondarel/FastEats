import {
  createMenuService,
  getMenusService,
  getMenuService,
  updateMenuService,
  deleteMenuService,
  getMenuByRestaurantIdService,
  getMenuByMenuIdService,
} from "../service/menuService.js";
import { getRestaurantByOwnerIdService } from "../service/restaurantService.js";
import {
  validateCreateMenuRequest,
  validateUpdateMenuRequest,
} from "../validator/menuValidator.js";

const createMenuController = async (req, res) => {
  const menuReq = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only sellers can create a menu",
    });
  }

  try {
    const restaurant = await getRestaurantByOwnerIdService(userId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    menuReq.restaurantId = restaurant.restaurant_id;
    if(req.file) {
      menuReq.menuImage = req.file.filename;
    }

    const errors = await validateCreateMenuRequest(menuReq);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const newMenu = await createMenuService(menuReq);

    return res.status(201).json({
      success: true,
      message: "Menu created successfully",
      dataMenu: newMenu,
    });
  } catch (err) {
    console.error("❌ Error creating menu:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Menu name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMenusController = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only sellers can get menus",
    });
  }

  const restaurant = await getRestaurantByOwnerIdService(userId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found for this owner",
    });
  }

  try {
    const result = await getMenusService(restaurant.restaurant_id);

    return res.status(200).json({
      success: true,
      menus: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMenuByRestoIdController = async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    const result = await getMenuByRestaurantIdService(restaurantId);

    return res.status(200).json({
      success: true,
      menus: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getMenuByMenuIdController = async (req, res) => {
  try {
    const { menuId } = req.params;

    if (!menuId || isNaN(menuId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menuId",
      });
    }

    const result = await getMenuByMenuIdService(menuId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    return res.status(200).json({
      success: true,
      menu: result,
    });
  } catch (err) {
    console.error("❌ Error in getMenuByMenuIdController:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMenuController = async (req, res) => {
  const { role, userId } = req.user;
  if (role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only seller can update restaurant",
    });
  }
  const menuId = req.params.menuId;
  const menuReq = req.body;
  try {
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const restaurantId = restaurant.restaurant_id;

    if (menu.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu",
      });
    }

    if(req.file) {
      menuReq.menuImage = req.file.filename;
    }

    const errors = await validateUpdateMenuRequest(menuReq, restaurantId);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const updatedMenu = await updateMenuService(menuReq, menuId);
    if (!updatedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      dataMenu: updatedMenu,
    });
  } catch (err) {
    console.error("❌ Error updating menu:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteMenuController = async (req, res) => {
  const { role, userId } = req.user;
  const menuId = req.params.menuId;
  if (role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only seller can delete menu",
    });
  }

  try {
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const restaurantId = restaurant.restaurant_id;

    if (menu.restaurant_id !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu",
      });
    }

    const deletedMenu = await deleteMenuService(menuId);
    if (!deletedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu delete failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
      dataMenu: deletedMenu,
    });
  } catch (err) {
    console.error("❌ Error deleting menu:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateAvailableMenuController = async(req, res) => {
  const { role, userId } = req.user;
  if(role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only seller can update menu availability"
    })
  }
  try {
    const restaurant = await getRestaurantByOwnerIdService(userId);
  
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found for this owner",
        });
      }

      const menuId = req.params.menuId;
      const { isAvailable } = req.body;

      const menu = await getMenuByMenuIdService(menuId);
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: "Menu not found",
        });
      }

      const restaurantId = restaurant.restaurant_id;
      if(menu.restaurant_id !== restaurantId) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this menu",
        });
      }

      const response = await updateAvailableMenuService({isAvailable}, menuId);
      if(!response) {
        return res.status(404).json({
          success: false,
          message: "Menu update failed",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Menu availability updated successfully",
        dataMenu: response
      });
  } catch(err) {
    console.error("❌ Error updating menu availability:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  
}

export {
  createMenuController,
  getMenusController,
  getMenuByMenuIdController,
  updateMenuController,
  deleteMenuController,
  getMenuByRestoIdController,
  updateAvailableMenuController
};
