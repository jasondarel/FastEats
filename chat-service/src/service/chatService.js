import axios from "axios";
import pool from "../config/dbInit.js";

// export const isRestaurantAvailableByNameId = async (restaurantName, restaurantId) => {
//     const result = await pool.query(
//         `SELECT 1 FROM restaurants WHERE restaurant_name = $1 AND restaurant_id != $2`,
//         [restaurantName, restaurantId]
//     );
//     return result.rowCount > 0;
// };