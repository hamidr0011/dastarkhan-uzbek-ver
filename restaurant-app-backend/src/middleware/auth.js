import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { rows } = await pool.query(
            'SELECT id, name, email, role, phone FROM users WHERE id = $1',
            [decoded.id]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token expired or invalid' });
    }
};

export const requireManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ success: false, error: 'Manager access required' });
    }
    next();
};
