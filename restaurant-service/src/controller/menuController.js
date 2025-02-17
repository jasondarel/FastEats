import { 
    createMenuService,
    getMenusService,
    getMenuService,
    updateMenuService,
    deleteMenuService, 
    getMenuByRestaurantIdService
} from "../service/menuService.js"
import { 
    validateCreateMenuRequest 
} from "../validator/menuValidator.js";

const createMenuController = async(req, res) => {
    const menuReq = req.body;
    try {
        const errors = await validateCreateMenuRequest(menuReq);
        const errorLen = Object.keys(errors).length;
        if(errorLen > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            })
        }

        const newMenu = await createMenuService(menuReq);
        return res.status(201).json({
            success: true,
            message: "Create Menu success",
            dataMenu: newMenu
        })
    } catch(err) {
        console.error("❌ Error creating Menu:", err);

        if (err.code === "23505") { 
            return res.status(400).json({
                success: false,
                message: "Menu name or owner already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const getMenusController = async(req, res) => {
    try {
        const result = await getMenusService();

        return res.status(200).json({
            success: true,
            menus: result
        })
    } catch(err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getMenuByRestoIdController = async(req, res) => {
    const restaurantId = req.params.restaurantId;
    try {
        const result = await getMenuByRestaurantIdService(restaurantId);

        return res.status(200).json({
            success: true,
            menus: result
        })
    } catch(err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getMenuController = async(req, res) => {

}

const updateMenuController = async(req, res) => {

}

const deleteMenuController = async(req, res) => {

}

export {
    createMenuController,
    getMenusController,
    getMenuController,
    updateMenuController,
    deleteMenuController,
    getMenuByRestoIdController
};