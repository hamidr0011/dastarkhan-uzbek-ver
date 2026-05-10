import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { dash } from '@better-auth/infra';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const database = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    : undefined;

const betterAuthBaseUrl = process.env.BETTER_AUTH_URL || 'http://192.168.1.10:5000';
const betterAuthOrigin = (() => {
    try {
        return new URL(betterAuthBaseUrl).origin;
    } catch {
        return null;
    }
})();

const trustedOrigins = [
    betterAuthOrigin,
    'dastarkhanuzbekistan://',
    'dastarkhanuzbekistan://*',
    'exp://',
    'exp://**',
    'exp://192.168.*.*:*/**',
    'http://localhost:8083',
    'http://192.168.1.10:8083',
].filter(Boolean);

export const auth = betterAuth({
    appName: 'Dastarkhan Uzbekistan',
    basePath: '/api/better-auth',
    baseURL: betterAuthBaseUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    database,
    trustedOrigins,
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            phone: {
                type: 'string',
                required: false,
                defaultValue: '',
            },
            role: {
                type: ['customer', 'manager'],
                required: false,
                defaultValue: 'customer',
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
    },
    plugins: [
        expo(),
        ...(process.env.BETTER_AUTH_API_KEY
            ? [dash({ apiKey: process.env.BETTER_AUTH_API_KEY })]
            : []),
    ],
});

export default auth;
