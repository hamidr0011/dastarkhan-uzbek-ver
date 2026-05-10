import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { loginWithSupabase, logoutFromSupabase, registerWithSupabase, getGoogleOAuthUrl, loginWithOAuthTokens } from '../services/supabaseAuth';
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

    const loginWithSupabaseGoogle = async () => {
        setIsLoading(true);
        try {
            const redirectUrl = AuthSession.makeRedirectUri();
            const authUrl = getGoogleOAuthUrl(redirectUrl);
            
            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
            
            if (result.type === 'success' && result.url) {
                const hash = result.url.split('#')[1] || result.url.split('?')[1];
                if (!hash) {
                    return { success: false, error: 'No tokens returned from Google' };
                }
                const params = hash.split('&').reduce((acc, current) => {
                    const [key, value] = current.split('=');
                    acc[key] = decodeURIComponent(value);
                    return acc;
                }, {});

                const accessToken = params.access_token;
                const refreshToken = params.refresh_token;
                
                if (accessToken) {
                    const response = await loginWithOAuthTokens({ accessToken, refreshToken });
                    if (response.success) {
                        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(response.user));
                        setUser(response.user);
                        return { success: true, user: response.user };
                    }
                }
            }
            return { success: false, error: 'Google login cancelled or failed.' };
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
            
            if (!response.requiresEmailConfirmation && response.session) {
                const sessionUser = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.user_metadata?.name || name,
                    phone: response.user.user_metadata?.phone || phone,
                    role: response.user.user_metadata?.role || role,
                    token: response.session.access_token,
                    authProvider: 'supabase'
                };
                await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
                setUser(sessionUser);
            }

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
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogleSession, loginWithSupabaseGoogle, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
