import pool from "../config/dbInit.js";

export const createMenuService = async (client=pool, menuReq) => {
  const result = await client.query(
    `INSERT INTO menu_item (menu_name, menu_description, menu_price, menu_category, restaurant_id, menu_image) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      menuReq.menuName,
      menuReq.menuDescription,
      menuReq.menuPrice,
      menuReq.menuCategory,
      menuReq.restaurantId,
      menuReq.menuImage,
    ]
  );
  return result.rows[0];
};

export const createAddsOnCategoryService = async (client=pool, {
  menuId,
  categoryName,
  isRequired= false,
  maxSelectable=1
}) => {
  const result = await client.query(
    `INSERT INTO menu_adds_on_category (menu_id, category_name, is_required, max_selectable) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
    [menuId, categoryName, isRequired, maxSelectable]
  );
  return result.rows[0];
}

export const createAddsOnItemService = async (client=pool, {
  categoryId,
  addsOnName,
  addsOnPrice = 0
}) => {
  const result = await client.query(
    `INSERT INTO menu_adds_on_item (category_id, adds_on_name, adds_on_price) 
        VALUES ($1, $2, $3) RETURNING *`,
    [categoryId, addsOnName, addsOnPrice]
  );
  return result.rows[0];
}

export const deleteAddsOnCategoryService = async (client=pool, categoryId) => {
  const result = await client.query(
    `DELETE FROM menu_adds_on_category WHERE category_id = $1 RETURNING *`,
    [categoryId]
  );
  return result.rows[0];
}

export const deleteAddsOnItemService = async (client=pool, itemId) => {
  const result = await client.query(
    `DELETE FROM menu_adds_on_item WHERE item_id = $1 RETURNING *`,
    [itemId]
  );
  return result.rows[0];
}

export const updateAvailableMenuService = async (menuId, isAvailable) => {
  const result = await pool.query(
    `UPDATE menu_item SET is_available = $1 WHERE menu_id = $2 RETURNING *`,
    [isAvailable, menuId]
  );
  return result.rows[0];
}

export const getMenusService = async (restaurantId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_item  WHERE restaurant_id = $1",
      [restaurantId]
    );
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    throw error;
  }
};

export const getMenuByRestaurantIdService = async (restaurantId) => {
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

export const getMenuByMenuIdService = async (menuId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_item WHERE menu_id = $1",
      [menuId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error fetching menu:", error);
    throw error;
  }
};

export const getAddsOnCategoriesService = async (menuId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_adds_on_category WHERE menu_id = $1",
      [menuId]
    );
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching adds-on categories:", error);
    throw error;
  }
}

export const updateAddsOnCategoryService = async (client=pool, {
  categoryId,
  categoryName,
  isRequired = false,
  maxSelectable = 1
}) => {
  const result = await client.query(
    `UPDATE menu_adds_on_category 
    SET category_name = $1, 
        is_required = $2, 
        max_selectable = $3
    WHERE category_id = $4 RETURNING *`,
    [categoryName, isRequired, maxSelectable, categoryId]
  );
  return result.rows[0];
}

export const updateAddsOnItemService = async (client=pool, {
  itemId,
  addsOnName,
  addsOnPrice = 0
}) => {
  const result = await client.query(
    `UPDATE menu_adds_on_item 
    SET adds_on_name = $1, 
        adds_on_price = $2
    WHERE item_id = $3 RETURNING *`,
    [addsOnName, addsOnPrice, itemId]
  );
  return result.rows[0];
}

export const getAddsOnItemsService = async (categoryId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_adds_on_item WHERE category_id = $1",
      [categoryId]
    );
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching adds-on items:", error);
    throw error;
  }
}

export const updateMenuService = async (client=pool, menuReq, menuId) => {
  const result = await client.query(
    `UPDATE menu_item 
    SET menu_name = $1, 
        menu_description = $2, 
        menu_price = $3, 
        menu_category = $4, 
        menu_image = $5,
        updated_at = NOW()
    WHERE menu_id = $6 
    RETURNING *`,
    [
      menuReq.menuName,
      menuReq.menuDescription,
      menuReq.menuPrice,
      menuReq.menuCategory,
      menuReq.menuImage,
      menuId,
    ]
  );

  return result.rows[0];
};

export const deleteMenuService = async (menuId) => {
  const result = await pool.query(
    `DELETE FROM menu_item WHERE menu_id = $1 RETURNING *`,
    [menuId]
  );
  return result.rows[0];
};

export const isMenuAvailable = async (menuName, restaurantId) => {
  const result = await pool.query(
    "SELECT 1 FROM menu_item WHERE menu_name ILIKE $1 AND restaurant_id = $2",
    [menuName, restaurantId]
  );
  return result.rowCount > 0;
};