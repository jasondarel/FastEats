import pool from "../config/dbInit.js";

export const createTransactionService = async (transaction) => {
    if (transaction.id) {
        const result = await pool.query(
            `UPDATE transactions SET
                currency = $1,
                transaction_time = $2,
                expiry_time = $3,
                bank = $4,
                va_number = $5,
                payment_type = $6,
                shipping_province = $7,
                shipping_city = $8,
                shipping_district = $9,
                shipping_village = $10,
                shipping_address = $11,
                shipping_phone = $12,
                shipping_name = $13,
                updated_at = NOW(),
                transaction_gross = $15,
                transaction_net = $16,
                tax = $17
            WHERE transaction_id = $14
            RETURNING *`,
            [
                transaction.currency,
                transaction.transaction_time,
                transaction.expiry_time,
                transaction.bank || null,
                transaction.va_number || null,
                transaction.payment_type,
                transaction.shipping_province || 'unknown',
                transaction.shipping_city || 'unknown',
                transaction.shipping_district || 'unknown',
                transaction.shipping_village || 'unknown',
                transaction.shipping_address || 'unknown',
                transaction.shipping_phone || 'unknown',
                transaction.shipping_name || 'unknown',
                transaction.id,
                transaction.gross_amount || 0,
                transaction.transaction_net || 0,
                transaction.tax || 0
            ]
        );
        return result.rows[0];
    } else {
        const result = await pool.query(
            `INSERT INTO transactions 
                (order_id, currency, transaction_time, expiry_time, bank, va_number, payment_type, shipping_province, shipping_city, shipping_district, shipping_village, shipping_address, shipping_phone, shipping_name, transaction_gross, transaction_net, tax) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
            RETURNING *`,
            [
                transaction.order_id,
                transaction.currency,
                transaction.transaction_time,
                transaction.expiry_time,
                transaction.bank || null,
                transaction.va_number || null,
                transaction.payment_type,
                transaction.shipping_province || 'unknown',
                transaction.shipping_city || 'unknown',
                transaction.shipping_district || 'unknown',
                transaction.shipping_village || 'unknown',
                transaction.shipping_address || 'unknown',
                transaction.shipping_phone || 'unknown',
                transaction.shipping_name || 'unknown',  
                transaction.gross_amount || 0,
                transaction.transaction_net || 0,
                transaction.tax || 0
            ]
        );
        return result.rows[0];
    }
};

export const getTransactionByOrderIdService = async (orderId) => {
    const result = await pool.query(
        "SELECT * FROM transactions WHERE order_id = $1",
        [orderId]
    );
    return result.rows[0];
}