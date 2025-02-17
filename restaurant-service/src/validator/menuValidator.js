import { 
    isMenuAvailable 
} from "../service/menuService.js";
import { isRestaurantAvailableById } from "../service/restaurantService.js";

const validateCreateMenuRequest = async(menuReq) => {
    const errors = {};

    if (!menuReq.menuName || menuReq.menuName.trim() === '') {
        errors.menuName = 'Menu name is required';
    } else {
        const isAvailableMenu = await isMenuAvailable(menuReq.menuName);
        if(isAvailableMenu) {
            errors.menuName = "Menu name already exist"
        }
    }

    const validCategories = ["Food", "Drink", "Dessert", "Others"];
    if (!menuReq.menuCategory || menuReq.menuCategory.trim() === '') {
        errors.menuCategory = 'Menu category is required';
    } else if (!validCategories.includes(menuReq.menuCategory)) {
        errors.menuCategory = "Menu category must be one of (Food, Drink, Dessert, Others)";
    }
    
    if (menuReq.menuPrice === undefined || menuReq.menuPrice === null) {
        errors.menuPrice = 'Menu price is required';
    } else if (isNaN(menuReq.menuPrice) || menuReq.menuPrice <= 0) {
        errors.menuPrice = 'Menu price must be a positive number';
    }

    return errors
}

const validateUpdateMenuRequest = async(menuReq) => {

}

export {
    validateCreateMenuRequest,
    validateUpdateMenuRequest
};