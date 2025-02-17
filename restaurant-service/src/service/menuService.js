import pool from "../config/dbInit.js"

const createMenuService = async(menuReq) => {
    const result = await pool.query(
        `INSERT INTO menu_item (menu_name, menu_description, menu_price, menu_category, restaurant_id) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [menuReq.menuName, menuReq.menuDescription, menuReq.menuPrice, menuReq.menuCategory, menuReq.restaurantId]
    );
    
    return result.rows[0];
}

const getMenusService = async() => {
    try {
        const result = await pool.query("SELECT * FROM menu_item");
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching menus:", error);
        throw error;
    }
}

const getMenuByRestaurantIdService = async (restaurantId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM menu_item WHERE restaurant_id = $1",
            [restaurantId]
        );
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching menus:", error);
        throw error;
    }
};


const getMenuService = async(menuId) => {

}

const updateMenuService = async(menuReq, menuId) => {

}

const deleteMenuService = async(menuId) => {

}

const isMenuAvailable = async(menuName) => {
    const result = await pool.query(
        `SELECT 1 FROM menu_item WHERE menu_name = $1`,
        [menuName]
    );
    return result.rowCount > 0;
}

export {
    createMenuService,
    getMenusService,
    getMenuService,
    updateMenuService,
    deleteMenuService,
    isMenuAvailable,
    getMenuByRestaurantIdService
};