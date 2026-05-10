import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

// POST create reservation (customer)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { date, time, guests, special_requests } = req.body;
        const tableNumber = Math.floor(1 + Math.random() * 20).toString();

        const { rows } = await pool.query(
            "INSERT INTO reservations (customer_id, customer_name, date, time, guests, table_number, status, special_requests) VALUES ($1, $2, $3, $4, $5, $6, 'Confirmed', $7) RETURNING *",
            [req.user.id, req.user.name, date, time, guests, tableNumber, special_requests || '']
        );
        const data = rows[0];

        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET customer's own reservations
router.get('/my-reservations', verifyToken, async (req, res) => {
    try {
        const { rows: data } = await pool.query(
            'SELECT * FROM reservations WHERE customer_id = $1 ORDER BY date DESC',
            [req.user.id]
        );

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET all reservations (manager only)
router.get('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.query;
        let queryStr = 'SELECT * FROM reservations';
        let queryParams = [];

        if (status && status !== 'All') {
            queryStr += ' WHERE status = $1';
            queryParams.push(status);
        }

        queryStr += ' ORDER BY date DESC';

        const { rows: data } = await pool.query(queryStr, queryParams);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH cancel reservation (customer)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT customer_id, status FROM reservations WHERE id = $1',
            [req.params.id]
        );
        const res_ = rows[0];

        if (!res_) return res.status(404).json({ success: false, error: 'Reservation not found' });
        if (res_.customer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
        if (res_.status !== 'Confirmed') return res.status(400).json({ success: false, error: 'Only confirmed reservations can be cancelled' });

        const { rows: updatedRows } = await pool.query(
            "UPDATE reservations SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        const data = updatedRows[0];

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH manager confirm/cancel reservation
router.patch('/:id/status', verifyToken, requireManager, async (req, res) => {
    try {
        const { status } = req.body;
        const { rows } = await pool.query(
            'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Reservation not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET dashboard stats (manager only)
router.get('/stats/dashboard', verifyToken, requireManager, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const ordersRes = await pool.query('SELECT status, total, created_at FROM orders');
        const reservationsRes = await pool.query('SELECT date, status FROM reservations');
        const menuRes = await pool.query('SELECT count(*) as count FROM menu_items');

        const orders = ordersRes.rows || [];
        const reservations = reservationsRes.rows || [];

        const activeOrders = orders.filter(o =>
            ['Placed', 'Preparing', 'Ready'].includes(o.status)
        ).length;

        const todayRevenue = orders
            .filter(o => o.created_at?.toISOString().startsWith(today) && o.status !== 'Cancelled')
            .reduce((sum, o) => sum + parseFloat(o.total), 0);

        const todayReservations = reservations.filter(r => new Date(r.date).toISOString().startsWith(today)).length;

        return res.status(200).json({
            success: true,
            data: {
                activeOrders,
                todayRevenue: todayRevenue.toFixed(2),
                todayReservations,
                totalMenuItems: parseInt(menuRes.rows[0].count) || 0
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
