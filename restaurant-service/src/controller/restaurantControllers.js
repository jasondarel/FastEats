import { 
    createRestaurantService, deleteRestaurantService, getRestaurantByOwnerIdService, getRestaurantService, 
    getRestaurantsService,
    updateRestaurantService
} from "../service/restaurantService.js";
import { validateCreateRestaurantRequest, validateUpdateRestaurantRequest } from "../validator/restaurantValidators.js";

const createRestaurantController = async(req, res) => {
    const restaurantReq = req.body;
    console.log(restaurantReq)
    try {
        const errors = await validateCreateRestaurantRequest(restaurantReq);
        const errorLen = Object.keys(errors).length;
        if(errorLen > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            })
        }

        const newRestaurant = await createRestaurantService(restaurantReq);
        return res.status(201).json({
            success: true,
            message: "Create restaurant success",
            dataRestaurant: newRestaurant
        })
    } catch(err) {
        console.error("❌ Error creating restaurant:", err);

        if (err.code === "23505") { 
            return res.status(400).json({
                success: false,
                message: "Restaurant name or owner already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
    
}

const updateRestaurantController = async (req, res) => {
    const { restaurantId } = req.params;
    const restaurantReq = req.body;

    try {
        const errors = await validateUpdateRestaurantRequest(restaurantReq);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        const updatedRestaurant = await updateRestaurantService(restaurantReq, restaurantId);

        if (!updatedRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Update restaurant success",
            dataRestaurant: updatedRestaurant
        });
    } catch (err) {
        console.error("❌ Error updating restaurant:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const deleteRestaurantController = async (req, res) => {
    const { restaurantId } = req.params;

    try {
        const deletedRestaurant = await deleteRestaurantService(restaurantId);

        if (!deletedRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Delete restaurant success",
            deletedData: deletedRestaurant
        });
    } catch (err) {
        console.error("❌ Error deleting restaurant:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getRestaurantsController = async(req, res) => {
    try {
        const result = await getRestaurantsService();

        return res.status(200).json({
            success: true,
            restaurants: result
        })
    } catch(err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


const getRestaurantByOwnerIdController = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const result = await getRestaurantByOwnerIdService(ownerId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({
            success: true,
            restaurant: result
        });
    } catch (err) {
        console.error("❌ Error in getRestaurantController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getRestaurantController = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const result = await getRestaurantService(restaurantId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        return res.status(200).json({
            success: true,
            restaurant: result
        });
    } catch (err) {
        console.error("❌ Error in getRestaurantController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export {
    createRestaurantController,
    getRestaurantsController,
    getRestaurantByOwnerIdController,
    getRestaurantController,
    updateRestaurantController,
    deleteRestaurantController
};