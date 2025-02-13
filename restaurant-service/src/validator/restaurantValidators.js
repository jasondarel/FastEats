import { isRestaurantAvailable } from "../service/restaurantService.js";

const validateCreateRestaurantRequest = async(restaurantReq) => {
    const errors = {};

    if (!restaurantReq.restaurantName || restaurantReq.restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else {
        const isAvailableRestaurant = isRestaurantAvailable(restaurantReq.restaurantName);
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
    } else if(!isOwnerAvailable) {
        
    }

    return errors
}

export {
    validateCreateRestaurantRequest
};