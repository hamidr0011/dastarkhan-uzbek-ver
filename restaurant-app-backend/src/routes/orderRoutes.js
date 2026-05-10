import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

const ACTIVE_TABLE_STATUSES = ['Placed', 'Preparing', 'Ready'];

const generateOrderCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `UZB-${num}`;
};

router.get('/tables/:tableNumber/availability', verifyToken, async (req, res) => {
    try {
        const tableNumber = Number(req.params.tableNumber);

        if (!Number.isInteger(tableNumber) || tableNumber < 1) {
            return res.status(400).json({ success: false, error: 'Invalid table number' });
        }

        const { rows: activeOrders } = await pool.query(
            'SELECT id FROM orders WHERE table_number = $1 AND status = ANY($2::varchar[]) LIMIT 1',
            [tableNumber, ACTIVE_TABLE_STATUSES]
        );
        const { rows: activeReservations } = await pool.query(
            "SELECT id FROM reservations WHERE table_number = $1 AND status = 'Confirmed' AND date >= CURRENT_DATE LIMIT 1",
            [tableNumber]
        );

        const available = activeOrders.length === 0 && activeReservations.length === 0;
        return res.status(200).json({ success: true, available, tableNumber });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            items,
            subtotal = 0,
            tax = 0,
            total,
            currency = 'UZS',
            orderType,
            order_type,
            tableNumber,
            table_number,
            guestCount,
            guest_count,
            pickupName,
            pickup_name,
            pickupTime,
            pickup_time,
            paymentMethod,
            payment_method,
            paymentStatus,
            payment_status,
            paymentReference,
            payment_reference,
            specialRequest,
            special_request
        } = req.body;

        const normalizedOrderType = orderType || order_type;
        const normalizedTableNumber = tableNumber || table_number;
        const normalizedTotal = Number(total);

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Order must include at least one item' });
        }
        if (!['Dine In', 'Takeaway'].includes(normalizedOrderType)) {
            return res.status(400).json({ success: false, error: 'Order type must be Dine In or Takeaway' });
        }
        if (!['Card', 'PayPal', 'Cash at Counter'].includes(paymentMethod || payment_method)) {
            return res.status(400).json({ success: false, error: 'Invalid payment method' });
        }
        if (!Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
            return res.status(400).json({ success: false, error: 'Order total must be greater than zero' });
        }

        if (normalizedOrderType === 'Dine In') {
            const availability = await pool.query(
                'SELECT id FROM orders WHERE table_number = $1 AND status = ANY($2::varchar[]) LIMIT 1',
                [Number(normalizedTableNumber), ACTIVE_TABLE_STATUSES]
            );
            if (!normalizedTableNumber || availability.rows.length > 0) {
                return res.status(409).json({ success: false, error: 'Selected table is not available' });
            }
        }

        const orderCode = generateOrderCode();
        const customerName = req.user.name || req.user.email;

        const { rows } = await pool.query(
            `INSERT INTO orders (
                order_code, customer_id, customer_name, user_id, items, subtotal, tax, total, currency, status,
                order_type, table_number, guest_count, pickup_name, pickup_time,
                payment_method, payment_status, payment_reference, special_request, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Placed', $10, $11, $12, $13, $14, $15, $16, $17, $18, $18)
            RETURNING *`,
            [
                orderCode,
                req.user.id,
                customerName,
                req.user.id,
                JSON.stringify(items),
                Number(subtotal) || 0,
                Number(tax) || 0,
                normalizedTotal,
                currency,
                normalizedOrderType,
                normalizedOrderType === 'Dine In' ? Number(normalizedTableNumber) : null,
                normalizedOrderType === 'Dine In' ? Number(guestCount || guest_count || 1) : null,
                normalizedOrderType === 'Takeaway' ? (pickupName || pickup_name || customerName) : null,
                normalizedOrderType === 'Takeaway' ? (pickupTime || pickup_time || 'ASAP') : null,
                paymentMethod || payment_method,
                paymentStatus || payment_status || 'Payment pending',
                paymentReference || payment_reference || null,
                specialRequest || special_request || ''
            ]
        );

        return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const { rows: data } = await pool.query(
            'SELECT * FROM orders WHERE customer_id = $1 OR user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.query;
        let queryStr = 'SELECT * FROM orders';
        const queryParams = [];

        if (status && status !== 'All') {
            queryStr += ' WHERE status = $1';
            queryParams.push(status);
        }

        queryStr += ' ORDER BY created_at DESC';

        const { rows: data } = await pool.query(queryStr, queryParams);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/:id/status', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Placed', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        const { rows } = await pool.query(
            'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT status, customer_id, user_id FROM orders WHERE id = $1',
            [req.params.id]
        );
        const order = rows[0];

        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (![order.customer_id, order.user_id].includes(req.user.id)) return res.status(403).json({ success: false, error: 'Unauthorized' });
        if (order.status !== 'Placed') return res.status(400).json({ success: false, error: 'Only Placed orders can be cancelled' });

        const { rows: updatedRows } = await pool.query(
            "UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        return res.status(200).json({ success: true, data: updatedRows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
