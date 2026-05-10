import { getMigrations } from 'better-auth/db/migration';
import auth from './betterAuth.js';

export const runBetterAuthMigrations = async () => {
    if (!process.env.DATABASE_URL) {
        console.warn('Skipping Better Auth migrations: DATABASE_URL is not configured.');
        return;
    }

    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
    console.log('Better Auth tables ready.');
};
