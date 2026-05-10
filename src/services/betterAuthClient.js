import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const BETTER_AUTH_URL = process.env.EXPO_PUBLIC_BETTER_AUTH_URL || 'http://192.168.1.10:5000';

export const authClient = createAuthClient({
    baseURL: BETTER_AUTH_URL,
    basePath: '/api/better-auth',
    plugins: [
        expoClient({
            scheme: 'dastarkhanuzbekistan',
            storagePrefix: 'dastarkhanuzbekistan',
            storage: SecureStore,
        }),
    ],
});

const normalizeBetterAuthError = (error, fallback) => {
    if (!error) return fallback;
    return error.message || error.statusText || error.code || fallback;
};

const mapSessionUser = (user, token) => ({
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    phone: user.phone || '',
    role: user.role || 'customer',
    token,
    authProvider: 'better-auth',
});

export const registerWithBetterAuth = async ({ name, email, password, phone, role }) => {
    const { data, error } = await authClient.signUp.email({
        email: email.toLowerCase(),
        password,
        name,
        phone,
        role,
    });

    if (error) {
        throw new Error(normalizeBetterAuthError(error, 'Registration failed'));
    }

    return {
        success: true,
        user: data?.user ? mapSessionUser(data.user, data.token) : null,
    };
};

export const loginWithBetterAuth = async (email, password) => {
    const { data, error } = await authClient.signIn.email({
        email: email.toLowerCase(),
        password,
    });

    if (error) {
        throw new Error(normalizeBetterAuthError(error, 'Login failed'));
    }

    return {
        success: true,
        user: data?.user ? mapSessionUser(data.user, data.token) : null,
    };
};

export const loginWithBetterAuthGoogle = async () => {
    const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
    });

    if (error) {
        throw new Error(normalizeBetterAuthError(error, 'Google login failed'));
    }

    const session = await authClient.getSession();
    return {
        success: true,
        user: session?.data?.user ? mapSessionUser(session.data.user, data?.token) : null,
    };
};

export const logoutFromBetterAuth = async () => {
    await authClient.signOut().catch(() => null);
};
