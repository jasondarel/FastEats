import pool from "../config/dbInit.js";

export const registerService = async(userReq) => {
    const { name, email, password } = userReq;
    const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    return result.rows[0];
}

export const getUserByEmailService = async(email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0];
}