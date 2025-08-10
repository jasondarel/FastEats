import {
  createMenuService,
  getMenusService,
  updateMenuService,
  deleteMenuService,
  getMenuByRestaurantIdService,
  getMenuByMenuIdService,
  updateAvailableMenuService,
  createAddsOnCategoryService,
  createAddsOnItemService,
  getAddsOnCategoriesService,
  getAddsOnItemsService,
  updateAddsOnCategoryService,
  updateAddsOnItemService,
  deleteAddsOnCategoryService,
  deleteAddsOnItemService,
} from "../service/menuService.js";
import { getRestaurantByOwnerIdService } from "../service/restaurantService.js";
import {
  validateCreateMenuRequest,
  validateUpdateMenuRequest,
} from "../validator/menuValidator.js";
import logger from "../config/loggerInit.js";
import { responseError, responseSuccess } from "../util/responseUtil.js";
import pool from "../config/dbInit.js";

export const createMenuController = async (req, res) => {
  logger.info("CREATE MENU CONTROLLER");
  const menuReq = req.body;
  console.log("Menu Request Body:", menuReq);
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    logger.warn("Only sellers can create a menu");
    return responseError(res, 403, "Only sellers can create a menu");
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const restaurant = await getRestaurantByOwnerIdService(userId);
    if (!restaurant) {
      logger.warn("Restaurant not found for this owner");
      return responseError(res, 404, "Restaurant not found for this owner");
    }

    menuReq.restaurantId = restaurant.restaurant_id;
    if (req.file) {
      menuReq.menuImage = req.file.filename;
    }

    if (typeof menuReq.toppingCategories === "string") {
      try {
        menuReq.toppingCategories = JSON.parse(menuReq.toppingCategories);
      } catch (e) {
        logger.warn("Failed to parse toppingCategories JSON string");
        return responseError(res, 400, "Invalid toppingCategories format");
      }
    }

    const errors = await validateCreateMenuRequest(menuReq);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed:", errors);
      return responseError(res, 400, "Validation failed", errors);
    }

    const newMenu = await createMenuService(client, menuReq);

    if (menuReq.toppingCategories && Array.isArray(menuReq.toppingCategories)) {
      for (const category of menuReq.toppingCategories) {
        category.restaurantId = restaurant.restaurant_id;
        category.menuId = newMenu.menu_id;
        
        const newCategory = await createAddsOnCategoryService(client, {
          menuId: category.menuId,
          categoryName: category.name,
          isRequired: category.isRequired,
          maxSelectable: category.maxSelectable,
        });

        if (category.adds && Array.isArray(category.adds)) {
          for (const topping of category.adds) {
            const newItem = await createAddsOnItemService(client, {
              categoryId: newCategory.category_id,
              addsOnName: topping.adds_on_name,
              addsOnPrice: topping.adds_on_price,
            });
          }
        }
      }
    }
    await client.query('COMMIT');
    
    logger.info("Menu created successfully");
    return responseSuccess(res, 201, "Menu created successfully", "dataMenu", newMenu);

  } catch (err) {
    await client.query('ROLLBACK');
    
    if (err.code === "23505") {
      logger.warn("Menu name already exists");
      return responseError(res, 400, "Menu name already exists");
    }
    
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  } finally {
    client.release();
  }
};

export const getMenusController = async (req, res) => {
  logger.info("GET MENUS CONTROLLER");
  const userId = req.user.userId;
  const role = req.user.role;

  if (role !== "seller") {
    logger.warn("Only sellers can get menus");
    return responseError(res, 403, "Only sellers can get menus");
  }

  const restaurant = await getRestaurantByOwnerIdService(userId);
  if (!restaurant) {
    logger.warn("Restaurant not found for this owner");
    return responseError(res, 404, "Restaurant not found for this owner");
  }

  try {
    const result = await getMenusService(restaurant.restaurant_id);

    logger.info("Menus retrieved successfully");
    return responseSuccess(res, 200, "Menus retrieved successfully", "menus", result);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const getMenuByRestoIdController = async (req, res) => {
  logger.info("GET MENU BY RESTAURANT ID CONTROLLER");
  const restaurantId = req.params.restaurantId;
  try {
    const result = await getMenuByRestaurantIdService(restaurantId);
    if (!result) {
      logger.warn("Menu not found");
      return responseError(res, 404, "Menu not found");
    }

    logger.info("Menus retrieved successfully");
    return responseSuccess(res, 200, "Menus retrieved successfully", "menus", result);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const getMenuByMenuIdController = async (req, res) => {
  logger.info("GET MENU BY MENU ID CONTROLLER");
  try {
    const { menuId } = req.params;
    if (!menuId || isNaN(menuId)) {
      logger.warn("Invalid menuId");
      return responseError(res, 400, "Invalid menuId");
    }

    const result = await getMenuByMenuIdService(menuId);
    if (!result) {
      logger.warn("Menu not found");
      return responseError(res, 404, "Menu not found");
    }

    const addsOnCategories = await getAddsOnCategoriesService(menuId);
    if (addsOnCategories) {
      for (const category of addsOnCategories) {
        const addsOnItems = await getAddsOnItemsService(category.category_id);
        category.addsOnItems = addsOnItems;
      }
      result.addsOnCategories = addsOnCategories;
    }

    logger.info("Menu retrieved successfully");
    return responseSuccess(res, 200, "Menu retrieved successfully", "menu", result);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const updateMenuController = async (req, res) => {
  logger.info("UPDATE MENU CONTROLLER");
  const { role, userId } = req.user;
  if (role !== "seller") {
    logger.warn("Only seller can update restaurant");
    return responseError(res, 403, "Only seller can update restaurant");
  }
  const menuId = req.params.menuId;
  const menuReq = req.body;

  if(req.file) {
    menuReq.menuImage = req.file.filename;
  }

  try {
    const client = await pool.connect();
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      logger.warn("Menu not found");
      return responseError(res, 404, "Menu not found");
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);

    if (!restaurant) {
      logger.warn("Restaurant not found for this owner");
      return responseError(res, 404, "Restaurant not found for this owner");
    }

    const restaurantId = restaurant.restaurant_id;

    if (menu.restaurant_id !== restaurantId) {
      logger.warn("You are not allowed to update this menu");
      return responseError(res, 403, "You are not allowed to update this menu");
    }

    if(req.file) {
      menuReq.menuImage = req.file.filename;
    }

    menuReq.restaurantId = restaurantId;
    const errors = await validateUpdateMenuRequest(menuReq);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed:", errors);
      return responseError(res, 400, "Validation failed", errors);
    }

    const updatedMenu = await updateMenuService(client, menuReq, menuId);
    if (!updatedMenu) {
      logger.warn("Menu update failed");
      return responseError(res, 404, "Menu update failed");
    }

    menuReq.addsOnCategories = JSON.parse(menuReq.addsOnCategories || "[]");
    if (menuReq.addsOnCategories && Array.isArray(menuReq.addsOnCategories)) {
      for (const category of menuReq.addsOnCategories) {
        category.restaurantId = restaurantId;
        category.menuId = updatedMenu.menu_id;
        if (!category.category_id) {
          if (!category.deleted) {
            const newCategory = await createAddsOnCategoryService(client, {
              menuId: category.menuId,
              categoryName: category.category_name,
              isRequired: category.is_required,
              maxSelectable: category.max_selectable,
            });
            if (category.addsOnItems && Array.isArray(category.addsOnItems)) {
              for (const topping of category.addsOnItems) {
                if (!topping.deleted) {
                  await createAddsOnItemService(client, {
                    categoryId: newCategory.category_id,
                    addsOnName: topping.adds_on_name,
                    addsOnPrice: topping.adds_on_price,
                  });
                }
              }
            }
          }
        } else {
          if (!category.deleted) {
            const updatedCategory = await updateAddsOnCategoryService(client, {
              categoryId: category.category_id,
              categoryName: category.category_name,
              isRequired: category.is_required,
              maxSelectable: category.max_selectable,
            })
            if (category.addsOnItems && Array.isArray(category.addsOnItems)) {
              for (const topping of category.addsOnItems) {
                if (!topping.item_id) {
                  if (!topping.deleted) {
                    await createAddsOnItemService(client, {
                      categoryId: updatedCategory.category_id,
                      addsOnName: topping.adds_on_name,
                      addsOnPrice: topping.adds_on_price,
                    });
                  }
                } else {
                  if (!topping.deleted) {
                    await updateAddsOnItemService(client, {
                      itemId: topping.item_id,
                      addsOnName: topping.adds_on_name,
                      addsOnPrice: topping.adds_on_price,
                    })
                  } else {
                    await deleteAddsOnItemService(client, topping.item_id);
                  }
                }
              }
            }
          } else {
            await deleteAddsOnCategoryService(client, category.category_id);
          }
        }
      }
    }
    logger.info("Menu updated successfully");
    return responseSuccess(res, 200, "Menu updated successfully", "dataMenu", updatedMenu);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const deleteMenuController = async (req, res) => {
  logger.info("DELETE MENU CONTROLLER");
  const { role, userId } = req.user;
  const menuId = req.params.menuId;

  if (role !== "seller") {
    logger.warn("Only seller can delete menu");
    return responseError(res, 403, "Only seller can delete menu");
  }

  try {
    const menu = await getMenuByMenuIdService(req.params.menuId);
    if (!menu) {
      logger.warn("Menu not found");
      return responseError(res, 404, "Menu not found");
    }

    const restaurant = await getRestaurantByOwnerIdService(userId);
    if (!restaurant) {
      logger.warn("Restaurant not found for this owner");
      return responseError(res, 404, "Restaurant not found for this owner");
    }

    const restaurantId = restaurant.restaurant_id;
    if (menu.restaurant_id !== restaurantId) {
      logger.warn("You are not allowed to update this menu");
      return responseError(res, 403, "You are not allowed to update this menu");
    }

    const deletedMenu = await deleteMenuService(menuId);
    if (!deletedMenu) {
      logger.warn("Menu delete failed");
      return responseError(res, 404, "Menu delete failed");
    }

    logger.info("Menu deleted successfully");
    return responseSuccess(res, 200, "Menu deleted successfully", "dataMenu", deletedMenu);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const updateAvailableMenuController = async(req, res) => {
  logger.info("UPDATE MENU AVAILABILITY CONTROLLER");
  const { role, userId } = req.user;
  if(role !== "seller") {
    logger.warn("Only seller can update menu availability");
    return responseError(res, 403, "Only seller can update menu availability");
  }
  try {
    const restaurant = await getRestaurantByOwnerIdService(userId);
    if (!restaurant) {
      logger.warn("Restaurant not found for this owner");
      return responseError(res, 404, "Restaurant not found for this owner");
    }

    const menuId = req.params.menuId;
    const { isAvailable } = req.body;

    if(isAvailable === undefined) {
      logger.warn("isAvailable field is required");
      return responseError(res, 400, "isAvailable field is required");
    }

    const menu = await getMenuByMenuIdService(menuId);
    if (!menu) {
      logger.warn("Menu not found");
      return responseError(res, 404, "Menu not found");
    }

    const restaurantId = restaurant.restaurant_id;
    if(menu.restaurant_id !== restaurantId) {
      logger.warn("You are not allowed to update this menu");
      return responseError(res, 403, "You are not allowed to update this menu");
    }

    const response = await updateAvailableMenuService(menuId, isAvailable);
    if(!response) {
      logger.warn("Menu update failed");
      return responseError(res, 404, "Menu update failed");
    }

    logger.info("Menu availability updated successfully");
    return responseSuccess(res, 200, "Menu availability updated successfully", "dataMenu", response);
  } catch(err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
}