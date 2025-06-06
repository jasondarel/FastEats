import { 
    isOwnerAvailable, 
    isRestaurantAvailableByName, 
    isRestaurantAvailableByNameId 
} from "../service/restaurantService.js";

const validateCreateRestaurantRequest = async(restaurantReq) => {
    const errors = {};

    if (!restaurantReq.restaurantName || restaurantReq.restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else {
        const isAvailableRestaurant = await isRestaurantAvailableByName(restaurantReq.restaurantName);
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

const validateUpdateRestaurantRequest = async(restaurantReq) => {
    const errors = {};

    if (!restaurantReq.restaurantName || restaurantReq.restaurantName.trim() === '') {
        errors.restaurantName = 'Restaurant name is required';
    } else {
        const isAvailableRestaurant = await isRestaurantAvailableByNameId(restaurantReq.restaurantName, restaurantReq.restaurantId);
        if(isAvailableRestaurant) {
            errors.restaurantName = "Restaurant name already exist"
        }
    }

    if (!restaurantReq.restaurantAddress || restaurantReq.restaurantAddress.trim() === '') {
        errors.restaurantAddress = 'Restaurant address is required';
    } else if(restaurantReq.restaurantAddress.length < 10) {
        errors.restaurantAddress = "Restaurant address too short (10 characters minimum)";
    }

    if (!restaurantReq.restaurantProvince || restaurantReq.restaurantProvince.trim() === '') {
        errors.restaurantProvince = 'Restaurant province is required';
    }

    if (!restaurantReq.restaurantCity || restaurantReq.restaurantCity.trim() === '') {
        errors.restaurantCity = 'Restaurant city is required';
    }

    if (!restaurantReq.restaurantDistrict || restaurantReq.restaurantDistrict.trim() === '') {
        errors.restaurantDistrict = 'Restaurant district is required';
    }

    if (!restaurantReq.restaurantVillage || restaurantReq.restaurantVillage.trim() === '') {
        errors.restaurantVillage = 'Restaurant village is required';
    }

    return errors
}

export {
    validateCreateRestaurantRequest,
    validateUpdateRestaurantRequest
};