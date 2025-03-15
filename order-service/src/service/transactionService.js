import pool from "../config/dbInit.js";

const createTransactionService = async (transaction) => {
    console.log("transaction", transaction);
    const result = await pool.query(
        `INSERT INTO transactions 
            (order_id, currency, transaction_time, expiry_time, amount, bank, va_number, payment_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
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
        ]
    );

    return result.rows[0];
};

const getTransactionByOrderIdService = async (orderId) => {
    const result = await pool.query(
        "SELECT * FROM transactions WHERE order_id = $1",
        [orderId]
    );

    return result.rows[0];
}

export {
    createTransactionService,
    getTransactionByOrderIdService
}