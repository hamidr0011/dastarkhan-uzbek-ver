import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';

const router = express.Router();

// ─── REGISTER ─────────────────────────────────────
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must include a number'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('role').isIn(['customer', 'manager']).withMessage('Role must be customer or manager'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, role, managerCode } = req.body;

    try {
        // Validate manager access code
        if (role === 'manager' && managerCode !== 'DASTARKHAN2026') {
            return res.status(403).json({
                success: false,
                error: 'Invalid manager access code'
            });
        }

        // Check if email already exists
        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'An account with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { rows: newUsers } = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
            [name, email.toLowerCase(), hashedPassword, phone, role]
        );

        const newUser = newUsers[0];

        return res.status(201).json({
            success: true,
            message: `Registration successful. Welcome to Dastarkhan, ${name}!`,
            user: newUser
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, error: 'Server error during registration' });
    }
});

// ─── LOGIN ────────────────────────────────────────
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, error: 'JWT secret is not configured' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

export default router;
