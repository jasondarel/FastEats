import { 
    
} from "../service/chatService.js";
import { 

} from "../validator/chatValidators.js";
import jwt from 'jsonwebtoken';
import logger from "../config/loggerInit.js";

// export const createRestaurantController = async(req, res) => {
//     logger.info("CREATE RESTAURANT CONTROLLER");
//     const restaurantReq = req.body;
//     restaurantReq.ownerId = restaurantReq.ownerId
//     try {
//         const errors = await validateCreateRestaurantRequest(restaurantReq);
//         const errorLen = Object.keys(errors).length;
//         if(errorLen > 0) {
//             logger.warn("Validation failed", errors);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors
//             })
//         }

//         const newRestaurant = await createRestaurantService(restaurantReq);

//         logger.info(`Create restaurant success: name: ${newRestaurant.restaurant_name}`);
//         return res.status(201).json({
//             success: true,
//             message: "Create restaurant success",
//             dataRestaurant: newRestaurant
//         })
//     } catch(err) {
//         if (err.code === "23505") { 
//             logger.warn("Restaurant name or owner already exists", err);
//             return res.status(400).json({
//                 success: false,
//                 message: "Restaurant name or owner already exists"
//             });
//         }
//         logger.error("Internal Server Error", err);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         });
//     }
    
// }