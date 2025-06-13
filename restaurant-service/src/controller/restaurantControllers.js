import { 
    createRestaurantService, deleteRestaurantService, getRestaurantByOwnerIdService,
    getRestaurantByRestaurantIdService,
    getRestaurantsService,
    updateRestaurantService,
    updateOpenRestaurantService
} from "../service/restaurantService.js";
import { validateCreateRestaurantRequest, validateUpdateRestaurantRequest } from "../validator/restaurantValidators.js";
import jwt from 'jsonwebtoken';
import logger from "../config/loggerInit.js";
import { responseError, responseSuccess } from "../util/responseUtil.js";

export const createRestaurantController = async(req, res) => {
    logger.info("CREATE RESTAURANT CONTROLLER");
    const restaurantReq = req.body;
    restaurantReq.ownerId = restaurantReq.ownerId
    try {
        const errors = await validateCreateRestaurantRequest(restaurantReq);
        const errorLen = Object.keys(errors).length;
        if(errorLen > 0) {
            logger.warn("Validation failed", errors);
            return responseError(res, 400, "Validation failed", "error", errors);
        }

        const newRestaurant = await createRestaurantService(restaurantReq);

        logger.info(`Create restaurant success: name: ${newRestaurant.restaurant_name}`);
        return responseSuccess(res, 201, "Create restaurant success", "dataRestaurant", newRestaurant);
    } catch(err) {
        if (err.code === "23505") { 
            logger.warn("Restaurant name or owner already exists", err);
            return responseError(res, 400, "Restaurant name or owner already exists");
        }
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal Server Error");
    }
}

export const updateRestaurantController = async (req, res) => {
    logger.info("UPDATE RESTAURANT CONTROLLER");
    const { role, userId } = req.user;
    try {
        if (role !== "seller") {
            logger.warn("Only sellers can update a restaurant");
            return responseError(res, 403, "Only sellers can update a restaurant");
        }
        const restaurant = await getRestaurantByOwnerIdService(userId);
        if (!restaurant) {
            logger.warn("Restaurant not found for this owner");
            return responseError(res, 404, "Restaurant not found for this owner");
        }

        const restaurantId = restaurant.restaurant_id;
        const restaurantReq = req.body;

        if (req.file) {
            restaurantReq.restaurantImage = req.file.filename;
        }

        const errors = await validateUpdateRestaurantRequest(restaurantReq);
        if (Object.keys(errors).length > 0) {
            logger.warn("Validation failed", errors);
            return responseError(res, 400, "Validation failed", errors);
        }

        const updatedRestaurant = await updateRestaurantService(
            restaurantReq,
            restaurantId
        );
        if (!updatedRestaurant) {
            logger.error("Restaurant update failed");
            return responseError(res, 500, "Restaurant update failed");
        }

        logger.info(`Restaurant updated successfully: name: ${updatedRestaurant.restaurant_name}`);
        return responseSuccess(res, 200, "Restaurant updated successfully", "dataRestaurant", updatedRestaurant);
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            logger.error("Invalid or expired token", err);
            return responseError(res, 401, "Invalid or expired token");
        }

        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal Server Error");
    }
};

export const deleteRestaurantController = async (req, res) => {
    logger.info("DELETE RESTAURANT CONTROLLER");
    const { restaurantId } = req.params;
    try {
        const deletedRestaurant = await deleteRestaurantService(restaurantId);

        if (!deletedRestaurant) {
            logger.warn("Restaurant not found");
            return responseError(res, 404, "Restaurant not found");
        }

        logger.info(`Delete restaurant success: name: ${deletedRestaurant.restaurant_name}`);
        return responseSuccess(res, 200, "Delete restaurant success", "deletedData", deletedRestaurant);
    } catch (err) {
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal Server Error");
    }
};

export const getRestaurantsController = async(req, res) => {
    logger.info("GET RESTAURANTS CONTROLLER");
    const userId = req.user.userId;
    const { province, city, district, village } = req.query;
    const filters = {};
    if (province) filters.province = province;
    if (city) filters.city = city;
    if (district) filters.district = district;
    if (village) filters.village = village;

    try {
        const result = await getRestaurantsService(userId, filters);

        logger.info("Get restaurants success");
        return responseSuccess(res, 200, "Get restaurants success", "restaurants", result);
    } catch(err) {
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal server error");
    }
}

export const getRestaurantByOwnerIdController = async (req, res) => {
    logger.info("GET RESTAURANT BY OWNER ID CONTROLLER");
    const { ownerId } = req.params;
    try {
        const result = await getRestaurantByOwnerIdService(ownerId);

        if (!result) {
            logger.warn("Restaurant not found");
            return responseError(res, 404, "Restaurant not found");
        }

        logger.info("Get restaurant by owner id success");
        return responseSuccess(res, 200, "Get restaurant by owner id success", "restaurant", result);
    } catch (err) {
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal server error");
    }
};

export const getRestaurantByRestaurantIdController = async (req, res) => {
    logger.info("GET RESTAURANT BY RESTAURANT ID CONTROLLER");
    const { restaurantId } = req.params;
    try {
        if (!restaurantId || isNaN(restaurantId)) {
            logger.warn("Invalid restaurantId");
            return responseError(res, 400, "Invalid restaurantId");
        }

        const result = await getRestaurantByRestaurantIdService(restaurantId);

        if (!result) {
            logger.warn("Restaurant not found");
            return responseError(res, 404, "Restaurant not found");
        }

        logger.info("Get restaurant by restaurant id success");
        return responseSuccess(res, 200, "Get restaurant by restaurant id success", "restaurant", result);
    } catch (err) {
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal server error");
    }
};

export const getRestaurantController = async (req, res) => {
    logger.info("GET RESTAURANT CONTROLLER");
    const userId = req.user.userId;
    try {
        const restaurant = await getRestaurantByOwnerIdService(userId);

        if (!restaurant) {
            logger.warn("Restaurant not found for this owner");
            return responseError(res, 404, "Restaurant not found for this owner");
        }

        logger.info("Get restaurant success");
        return responseSuccess(res, 200, "Get restaurant success", "restaurant", restaurant);

    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            logger.error("Invalid or expired token", err);
            return responseError(res, 401, "Invalid or expired token");
        }
        
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal server error");
    }
};

export const updateOpenRestaurantController = async (req, res) => {
    logger.info("UPDATE OPEN RESTAURANT CONTROLLER");
    const {userId, role} = req.user;
    const isOpen = req.body.isOpen;
    try {

        if (role !== "seller") {
            logger.warn("Only sellers can open a restaurant");
            return responseError(res, 403, "Only sellers can open a restaurant");
        }

        if(isOpen === undefined) {
            logger.warn("isOpen field is required");
            return responseError(res, 400, "isOpen field is required");
        }

        const restaurant = await getRestaurantByOwnerIdService(userId);

        if (!restaurant) {
            logger.warn("Restaurant not found for this owner");
            return responseError(res, 404, "Restaurant not found for this owner");
        }

        const restaurantId = restaurant.restaurant_id;

        if(restaurant.owner_id !== userId) {
            logger.warn("You are not authorized to open this restaurant");
            return responseError(res, 403, "You are not authorized to open this restaurant");
        }

        const updatedRestaurant = await updateOpenRestaurantService(restaurantId, isOpen);

        logger.info("Restaurant is now open");
        return responseSuccess(res, 200, "Restaurant is now open", "dataRestaurant", updatedRestaurant);
    } catch (err) {
        logger.error("Internal Server Error", err);
        return responseError(res, 500, "Internal server error");
    }
}