import { 
    isMenuAvailable 
} from "../service/menuService.js";

export const validateCreateMenuRequest = async(menuReq) => {
    const errors = {};

    if (!menuReq.menuName || menuReq.menuName.trim() === '') {
        errors.menuName = 'Menu name is required';
    } else {
        const isAvailableMenu = await isMenuAvailable(menuReq.menuName);
        if(isAvailableMenu) {
            errors.menuName = "Menu name already exist"
        }
    }

    if(!menuReq.menuImage) {
        errors.menuImage = 'Menu image is required';
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

export const validateUpdateMenuRequest = async(menuReq) => {
    const errors = {};

    if (!menuReq.menuName || menuReq.menuName.trim() === '') {
        errors.menuName = 'Menu name is required';
    } else {
        const isAvailableMenu = await isMenuAvailable(menuReq.menuName, menuReq.menuId);
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

export const validateUpdateMenuDetailRequest = async(detailMenuReq) => {
    const errors = {};
    const menuSizes = ["Regular", "Medium", "Large"];
    if (!menuSizes.includes(detailMenuReq.menuSize)) {
        errors.menuSize = "Menu size must be one of (Regular, Medium, Large)";
    }

    if (detailMenuReq.menuStock === undefined || detailMenuReq.menuStock === null) {
        errors.menuStock = 'Menu stock is required';
    } else if (isNaN(detailMenuReq.menuStock) || detailMenuReq.menuStock < 0) {
        errors.menuStock = 'Menu stock must be a positive number';
    }

    return errors
}