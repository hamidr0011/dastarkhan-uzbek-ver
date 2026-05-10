import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithSupabase, logoutFromSupabase, registerWithSupabase } from '../services/supabaseAuth';
import { loginWithBetterAuthGoogle, logoutFromBetterAuth } from '../services/betterAuthClient';

export const AuthContext = createContext();

const SESSION_KEY = '@dastarkhan_user_session';
const MANAGER_CODE = 'DASTARKHAN2026';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userSession = await AsyncStorage.getItem(SESSION_KEY);
            if (userSession) {
                setUser(JSON.parse(userSession));
            }
        } catch (e) {
            console.log('Error checking login status', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await loginWithSupabase(email, password);
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(response.user));
            setUser(response.user);
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (user?.authProvider === 'better-auth') {
                await logoutFromBetterAuth();
            }
            await logoutFromSupabase(user?.token);
            await AsyncStorage.removeItem(SESSION_KEY);
            setUser(null);
        } catch (e) {
            console.log('Error logging out', e);
        }
    };

    const loginWithGoogleSession = async () => {
        setIsLoading(true);
        try {
            const response = await loginWithBetterAuthGoogle();
            if (!response.user) {
                return { success: false, error: 'Google login finished, but no session was returned.' };
            }
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(response.user));
            setUser(response.user);
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message || 'Google login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, password, phone, role = 'customer', managerCode = '') => {
        setIsLoading(true);
        try {
            if (role === 'manager' && managerCode !== MANAGER_CODE) {
                return { success: false, error: 'Invalid manager access code' };
            }

            const response = await registerWithSupabase({ name, email, password, phone, role });
            return {
                success: true,
                requiresEmailConfirmation: response.requiresEmailConfirmation,
            };
        } catch (error) {
            return { success: false, error: error.message || 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogleSession, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
