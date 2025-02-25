import pool from "../config/db.js";

const createTransactionService = async (transaction) => {
    const result = await pool.query(
        `INSERT INTO transactions 
            (order_id, currency, transaction_time, expiry_time, amount, bank, va_number, payment_type, transaction_status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
            transaction.order_id,
            transaction.currency,
            transaction.transaction_time,
            transaction.expiry_time,
            transaction.gross_amount,
            transaction.bank || null,
            transaction.va_number || null,
            transaction.payment_type,
            transaction.transaction_status
        ]
    );

    return result.rows[0];
};

export {
    createTransactionService
}