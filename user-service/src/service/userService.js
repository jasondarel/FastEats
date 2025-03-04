import pool from "../config/dbInit.js";

export const registerService = async(userReq) => {
    const { name, email, password } = userReq;
    const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    return result.rows[0];
}

export const getCurrentUserService = async(userId) => {
    const result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0];
}

export const validateUserService = async(userId) => {
    const result = await pool.query(
        "UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *",
        [userId]
    );
    return result.rows[0];
}

export const getUserByEmailService = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email ILIKE $1",
        [email]
    );
    return result.rows[0];
};


export const getUserByIdService = async(id) => {
    const result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

export const getUserDetailsByIdService = async(id) => {
    const result = await pool.query(
        "SELECT profile_photo, address, phone_number FROM user_details WHERE user_id = $1",
        [id]
    );
    return result.rows[0];
}

export const createUserDetailsService = async(userReq) => {
    const { user_id } = userReq;
    const result = await pool.query(
        "INSERT INTO user_details (user_id) VALUES ($1) RETURNING *",
        [user_id]
    );
    return result.rows[0];
}

export const updateUserDetailsService = async(userReq, user_id) => {
    const { profile_photo, address, phone_number } = userReq;
    const result = await pool.query(
        "UPDATE user_details SET profile_photo = $1, address = $2, phone_number = $3, updated_at = NOW() WHERE user_id = $4 RETURNING *",
        [profile_photo, address, phone_number, user_id]
    );
    return result.rows[0];
}

export const getPasswordHashByIdService = async(userId) => {
    const result = await pool.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0];
}

export const changePasswordService = async(userId, newPassword) => {
    const result = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *",
        [newPassword, userId]
    );
    return result.rows[0];
}

export const becomeSellerService = async(userId) => {
    const result = await pool.query(
        "UPDATE users SET role = 'seller' WHERE id = $1 RETURNING *",
        [userId]
    );
    return result.rows[0];
}