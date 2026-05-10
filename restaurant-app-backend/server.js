import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import reservationRoutes from './src/routes/reservationRoutes.js';
import pool from './src/config/db.js';
import { toNodeHandler } from 'better-auth/node';
import auth from './src/config/betterAuth.js';
import { runBetterAuthMigrations } from './src/config/betterAuthMigrations.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-create tables on startup
const runMigrations = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.warn('Skipping API table migrations: DATABASE_URL is not configured.');
            return;
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role VARCHAR(20) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50),
                image VARCHAR(500),
                available BOOLEAN DEFAULT true,
                is_special BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                items JSONB NOT NULL,
                subtotal DECIMAL(10,2) DEFAULT 0,
                tax DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(30) DEFAULT 'Placed',
                table_number INTEGER,
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(20) NOT NULL,
                guests INTEGER NOT NULL,
                table_number INTEGER,
                special_requests TEXT,
                status VARCHAR(30) DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(30);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE;');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0;');
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UZS';");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(30) DEFAULT 'Dine In';");
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_count INTEGER;');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_name VARCHAR(100);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(40);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(40);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(150);');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_request TEXT;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        await pool.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        await pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        console.log('Supabase/PostgreSQL tables ready.');
    } catch (err) {
        console.error('Migration error:', err.message);
    }
};


app.use(cors({
    origin: true,
    credentials: true,
}));

app.all('/api/better-auth/{*any}', toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dastarkhan Uzbekistan API is running',
        database: 'PostgreSQL via Supabase',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

const startServer = async () => {
    await runMigrations();
    await runBetterAuthMigrations();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Dastarkhan Uzbekistan API running on port ${PORT}`);
        console.log(`Database: PostgreSQL via Supabase`);
        console.log(`Health check: http://0.0.0.0:${PORT}/health`);
    });
};

startServer();
