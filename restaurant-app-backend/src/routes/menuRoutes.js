import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

// GET all menu items (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, available } = req.query;
        let queryStr = 'SELECT * FROM menu_items WHERE 1=1';
        let queryParams = [];
        let paramCount = 1;

        if (category && category !== 'All') {
            queryStr += ` AND category = $${paramCount}`;
            queryParams.push(category);
            paramCount++;
        }
        if (available === 'true') {
            queryStr += ` AND available = $${paramCount}`;
            queryParams.push(true);
            paramCount++;
        }
        if (search) {
            queryStr += ` AND name ILIKE $${paramCount}`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        queryStr += ' ORDER BY category, name';

        const { rows: data } = await pool.query(queryStr, queryParams);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET specials only (public)
router.get('/specials', async (req, res) => {
    try {
        const { rows: data } = await pool.query(
            'SELECT * FROM menu_items WHERE is_special = true AND available = true'
        );
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET single item (public)
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM menu_items WHERE id = $1',
            [req.params.id]
        );
        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Item not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST add new item (manager only)
router.post('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { name, category, description, price, image, available, is_special } = req.body;

        const { rows } = await pool.query(
            'INSERT INTO menu_items (name, category, description, price, image, available, is_special) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, category, description, price, image, available, is_special]
        );
        const data = rows[0];

        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PUT update item (manager only)
router.put('/:id', verifyToken, requireManager, async (req, res) => {
    try {
        const { name, category, description, price, image, available, is_special } = req.body;

        const { rows } = await pool.query(
            'UPDATE menu_items SET name = $1, category = $2, description = $3, price = $4, image = $5, available = $6, is_special = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [name, category, description, price, image, available, is_special, req.params.id]
        );

        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Item not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH toggle availability (manager only)
router.patch('/:id/availability', verifyToken, requireManager, async (req, res) => {
    try {
        const { available } = req.body;

        const { rows } = await pool.query(
            'UPDATE menu_items SET available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [available, req.params.id]
        );

        const data = rows[0];

        if (!data) return res.status(404).json({ success: false, error: 'Item not found' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE item (manager only)
router.delete('/:id', verifyToken, requireManager, async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            'DELETE FROM menu_items WHERE id = $1',
            [req.params.id]
        );

        if (rowCount === 0) return res.status(404).json({ success: false, error: 'Item not found' });
        return res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
