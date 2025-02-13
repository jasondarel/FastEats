import { isRestaurantAvailable, isOwnerAvailable } from "../service/restaurantService.js";

const validateCreateRestaurantRequest = async(restaurantReq) => {
    const errors = {};

    if (!restaurantReq.restaurantName || restaurantReq.restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else {
        const isAvailableRestaurant = await isRestaurantAvailable(restaurantReq.restaurantName);
        if(isAvailableRestaurant) {
            errors.restaurantName = "Restaurant name already exist"
        }
    }

    if (!restaurantReq.restaurantAddress || restaurantReq.restaurantAddress.trim() === '') {
        errors.restaurantAddress = 'Restaurant address is required';
    } else if(restaurantReq.restaurantAddress.length < 10) {
        errors.restaurantAddress = "Restaurant address too short (10 characters minimum)";
    }
    
    if(!restaurantReq.ownerId) {
        errors.ownerId = 'Owner ID is required';
    } else {
        const isExist = await isOwnerAvailable(restaurantReq.ownerId);
        if(!isExist) {
            errors.ownerId = 'Owner ID not found';
        }
    }

    return errors
}

const validateUpdateRestaurantRequest = async(restaurantReq) => {
    const errors = {};

    if (!restaurantReq.restaurantName || restaurantReq.restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else {
        const isAvailableRestaurant = await isRestaurantAvailable(restaurantReq.restaurantName);
        if(isAvailableRestaurant) {
            errors.restaurantName = "Restaurant name already exist"
        }
    }

    if (!restaurantReq.restaurantAddress || restaurantReq.restaurantAddress.trim() === '') {
        errors.restaurantAddress = 'Restaurant address is required';
    } else if(restaurantReq.restaurantAddress.length < 10) {
        errors.restaurantAddress = "Restaurant address too short (10 characters minimum)";
    }

    return errors
}

export {
    validateCreateRestaurantRequest,
    validateUpdateRestaurantRequest
};