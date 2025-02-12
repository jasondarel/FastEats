import { createRestaurantService } from "../service/restaurantService.js";
import { validateCreateRestaurantRequest } from "../validator/restaurantValidators.js";

const createRestaurantController = async(req, res) => {
    const restaurantReq = req.body;
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

export {
    createRestaurantController
};