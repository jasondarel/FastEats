import { 
    createRestaurantService, deleteRestaurantService, getRestaurantByOwnerIdService, getRestaurantService, 
    getRestaurantByRestaurantIdService,
    getRestaurantsService,
    updateRestaurantService
} from "../service/restaurantService.js";
import { validateCreateRestaurantRequest, validateUpdateRestaurantRequest } from "../validator/restaurantValidators.js";
import jwt from 'jsonwebtoken';

const createRestaurantController = async(req, res) => {
    const restaurantReq = req.body;
    restaurantReq.ownerId = req.user.userId;
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
    try {
        console.log("🔍 Incoming Request Body:", req.body);
        console.log("🔍 Uploaded File:", req.file); // Cek apakah file berhasil diterima

        const { role, userId } = req.user;

        if (role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can update a restaurant",
            });
        }

        const restaurant = await getRestaurantByOwnerIdService(userId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner",
            });
        }

        const restaurantId = restaurant.restaurant_id;
        const restaurantReq = req.body;

        // Jika ada file yang diupload, tambahkan ke request
        if (req.file) {
            restaurantReq.restaurantImage = req.file.filename; // Sesuaikan jika pakai storage lain
        }


        // Tambahkan validasi input
        const errors = await validateUpdateRestaurantRequest(restaurantReq);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        // Update restoran
        const updatedRestaurant = await updateRestaurantService(
            restaurantReq,
            restaurantId
        );
        if (!updatedRestaurant) {
            return res.status(500).json({
                success: false,
                message: "Restaurant update failed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            dataRestaurant: updatedRestaurant,
        });
    } catch (err) {
        console.error("❌ Error updating restaurant:", err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
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
    const userId = req.user.userId;
    try {
        const result = await getRestaurantsService(userId);

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

const getRestaurantByRestaurantIdController = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Cek apakah restaurantId valid (harus angka)
        if (!restaurantId || isNaN(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurantId"
            });
        }

        const result = await getRestaurantByRestaurantIdService(restaurantId);
        console.log(result)
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
        console.error("❌ Error in getRestaurantByRestaurantIdController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const getRestaurantController = async (req, res) => {
    try {
        const userId = req.user.userId;

        const restaurant = await getRestaurantByOwnerIdService(userId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner"
            });
        }

        return res.status(200).json({
            success: true,
            restaurant: restaurant
        });

    } catch (err) {
        console.error("❌ Error in getRestaurantController:", err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

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
    getRestaurantByRestaurantIdController,
    getRestaurantController,
    updateRestaurantController,
    deleteRestaurantController
};