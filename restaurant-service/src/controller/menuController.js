import {
  createMenuService,
  getMenusService,
  updateMenuService,
  deleteMenuService,
  getMenuByRestaurantIdService,
  getMenuByMenuIdService,
  updateAvailableMenuService,
} from "../service/menuService.js";
import { getRestaurantByOwnerIdService } from "../service/restaurantService.js";
import {
  validateCreateMenuRequest,
  validateUpdateMenuRequest,
} from "../validator/menuValidator.js";
import logger from "../config/loggerInit.js";

export const createMenuController = async (req, res) => {
  const menuReq = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    logger.error("Only sellers can create a menu");
    return res.status(403).json({
      success: false,
      message: "Only sellers can create a menu",
    });
  }

  try {
    const restaurant = await getRestaurantByOwnerIdService(userId);
    if (!restaurant) {
      logger.error("Restaurant not found for this owner");
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
      logger.error("Validation failed:", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const newMenu = await createMenuService(menuReq);

    logger.info("Menu created successfully");
    return res.status(201).json({
      success: true,
      message: "Menu created successfully",
      dataMenu: newMenu,
    });
  } catch (err) {
    if (err.code === "23505") {
      logger.error("Menu name already exists"); 
      return res.status(400).json({
        success: false,
        message: "Menu name already exists",
      });
    }
    logger.error("Internal Server Error", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMenusController = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    logger.error("Only sellers can get menus");
    return res.status(403).json({
      success: false,
      message: "Only sellers can get menus",
    });
  }

  const restaurant = await getRestaurantByOwnerIdService(userId);
  if (!restaurant) {
    logger.error("Restaurant not found for this owner");
    return res.status(404).json({
      success: false,
      message: "Restaurant not found for this owner",
    });
  }

  try {
    const result = await getMenusService(restaurant.restaurant_id);

    logger.info("Menus retrieved successfully");
    return res.status(200).json({
      success: true,
      menus: result,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMenuByRestoIdController = async (req, res) => {
  const restaurantId = req.params.restaurantId;
  try {
    const result = await getMenuByRestaurantIdService(restaurantId);
    if (!result) {
      logger.error("Menu not found");
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    logger.info("Menus retrieved successfully");
    return res.status(200).json({
      success: true,
      menus: result,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMenuByMenuIdController = async (req, res) => {
  try {
    const { menuId } = req.params;

    if (!menuId || isNaN(menuId)) {
      logger.error("Invalid menuId");
      return res.status(400).json({
        success: false,
        message: "Invalid menuId",
      });
    }

    const result = await getMenuByMenuIdService(menuId);

    if (!result) {
      logger.error("Menu not found");
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    logger.info("Menu retrieved successfully");
    return res.status(200).json({
      success: true,
      menu: result,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateMenuController = async (req, res) => {
  const { role, userId } = req.user;
  if (role !== "seller") {
    logger.error("Only seller can update restaurant");
    return res.status(403).json({
      success: false,
      message: "Only seller can update restaurant",
    });
  }
  const menuId = req.params.menuId;
  const menuReq = req.body;

  if(req.file) {
    menuReq.menuImage = req.file.filename;
  }

  try {
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      logger.error("Menu not found");
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);

    if (!restaurant) {
      logger.error("Restaurant not found for this owner");
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const restaurantId = restaurant.restaurant_id;

    if (menu.restaurant_id !== restaurantId) {
      logger.error("You are not allowed to update this menu");
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu",
      });
    }

    if(req.file) {
      menuReq.menuImage = req.file.filename;
    }

    menuReq.restaurantId = restaurantId;
    const errors = await validateUpdateMenuRequest(menuReq);
    if (Object.keys(errors).length > 0) {
      logger.error("Validation failed:",
      errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const updatedMenu = await updateMenuService(menuReq, menuId);
    if (!updatedMenu) {
      logger.error("Menu update failed");
      return res.status(404).json({
        success: false,
        message: "Menu update failed",
      });
    }

    logger.info("Menu updated successfully");
    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      dataMenu: updatedMenu,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteMenuController = async (req, res) => {
  const { role, userId } = req.user;
  const menuId = req.params.menuId;
  if (role !== "seller") {
    logger.error("Only seller can delete menu");
    return res.status(403).json({
      success: false,
      message: "Only seller can delete menu",
    });
  }

  try {
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      logger.error("Menu not found");
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);

    if (!restaurant) {
      logger.error("Restaurant not found for this owner");
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const restaurantId = restaurant.restaurant_id;

    if (menu.restaurant_id !== restaurantId) {
      logger.error("You are not allowed to update this menu");
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu",
      });
    }

    const deletedMenu = await deleteMenuService(menuId);
    if (!deletedMenu) {
      logger.error("Menu delete failed");
      return res.status(404).json({
        success: false,
        message: "Menu delete failed",
      });
    }

    logger.info("Menu deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
      dataMenu: deletedMenu,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAvailableMenuController = async(req, res) => {
  const { role, userId } = req.user;
  if(role !== "seller") {
    logger.error("Only seller can update menu availability");
    return res.status(403).json({
      success: false,
      message: "Only seller can update menu availability"
    })
  }
  try {
    const restaurant = await getRestaurantByOwnerIdService(userId);
  
      if (!restaurant) {
        logger.error("Restaurant not found for this owner");
        return res.status(404).json({
          success: false,
          message: "Restaurant not found for this owner",
        });
      }

      const menuId = req.params.menuId;
      const { isAvailable } = req.body;

      if(isAvailable === undefined) {
        logger.error("isAvailable field is required");
        return res.status(400).json({
          success: false,
          message: "isAvailable field is required",
        });
      }

      const menu = await getMenuByMenuIdService(menuId);
      if (!menu) {
        logger.error("Menu not found");
        return res.status(404).json({
          success: false,
          message: "Menu not found",
        });
      }

      const restaurantId = restaurant.restaurant_id;
      if(menu.restaurant_id !== restaurantId) {
        logger.error("You are not allowed to update this menu");
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this menu",
        });
      }

      const response = await updateAvailableMenuService(menuId, isAvailable);
      if(!response) {
        logger.error("Menu update failed");
        return res.status(404).json({
          success: false,
          message: "Menu update failed",
        });
      }

      logger.info("Menu availability updated successfully");
      return res.status(200).json({
        success: true,
        message: "Menu availability updated successfully",
        dataMenu: response
      });
  } catch(err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  
}