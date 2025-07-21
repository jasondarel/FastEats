import pool from "../config/dbInit.js";

export const registerService = async(userReq) => {
    const { name, email, password } = userReq;
    const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    return result.rows[0];
}

export const getUsersService = async() => {
    const result = await pool.query(
        "SELECT id, name, email, role FROM users"
    );
    return result.rows;
}

export const registerSellerService = async(userReq) => {
    const { name, email, password } = userReq;
    const result = await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, password, "seller"]
    );
    return result.rows[0];
}

export const createUserPaymentService = async(userId) => {
    const result = await pool.query(
        "INSERT INTO user_payments (user_id) VALUES ($1) RETURNING *",
        [userId]
    );
    return result.rows[0];
}

export const getUserPaymentByIdService = async(userId) => {
    const result = await pool.query(
        "SELECT bank_bca, gopay, dana FROM user_payments WHERE user_id = $1",
        [userId]
    );
    return result.rows[0];
}

export const updateUserPaymentService = async(userReq, userId) => {
    const { bcaAccount, gopay, dana } = userReq;
    const result = await pool.query(
        "UPDATE user_payments SET bank_bca = $1, gopay = $2, dana = $3, updated_at = NOW() WHERE user_id = $4 RETURNING *",
        [bcaAccount, gopay, dana, userId]
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
        "SELECT profile_photo, address, phone_number, province, city, district, village FROM user_details WHERE user_id = $1",
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
    const { profile_photo, address, phone_number, province, city, district, village } = userReq;
    const result = await pool.query(
        "UPDATE user_details SET profile_photo = $1, address = $2, phone_number = $3, province=$4, city=$5, district=$6, village=$7, updated_at = NOW() WHERE user_id = $8 RETURNING *",
        [profile_photo, address, phone_number, province, city, district, village, user_id]
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

export const createGoogleUserService = async(userReq) => {
    const { name, email, google_id, avatar } = userReq;
    const result = await pool.query(
        "INSERT INTO users (name, email, google_id, avatar, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, email, google_id, avatar, true]
    );
    return result.rows[0];
}

export const getUserByGoogleIdService = async(google_id) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE google_id = $1",
        [google_id]
    );
    return result.rows[0];
}

export const updateUserGoogleInfoService = async(userId, google_id, avatar) => {
    const result = await pool.query(
        "UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3 RETURNING *",
        [google_id, avatar, userId]
    );
    return result.rows[0];
}
