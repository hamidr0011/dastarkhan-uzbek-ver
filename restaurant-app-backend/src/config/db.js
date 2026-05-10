import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const missingDatabaseUrlError = () => new Error(
    'DATABASE_URL is not configured. Add the Supabase PostgreSQL connection string in restaurant-app-backend/.env.'
);

export const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    : {
        query: async () => {
            throw missingDatabaseUrlError();
        },
        on: () => null,
    };

if (process.env.DATABASE_URL) {
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}

export default pool;
