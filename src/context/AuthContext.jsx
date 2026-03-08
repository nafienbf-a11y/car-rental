import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize user from local storage on mount
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);

            // Re-validate session with database to ensure still active in DB
            // (e.g. admin didn't delete them or flip is_active to false manually)
            const checkSession = async () => {
                const { data, error } = await supabase
                    .from('app_users')
                    .select('is_active, role')
                    .eq('id', parsedUser.id)
                    .single();

                if (error || !data.is_active) {
                    // Force logout if not active
                    logout();
                } else if (data.role !== parsedUser.role) {
                    // Update role if changed
                    const updatedUser = { ...parsedUser, role: data.role };
                    localStorage.setItem('auth-user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            };
            checkSession();
        }
        setLoading(false);

        // Handle window close/unload to cleanup session
        const handleUnload = () => {
            if (user?.id) {
                // Use sendBeacon for reliable unload request (or standard fetch/supabase)
                // Note: supabase might not complete async requests during unload,
                // but we try our best.
                supabase.from('app_users').update({ is_active: false }).eq('id', user.id).then();
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    const login = async (username, password) => {
        try {
            // Find user in database
            const { data: foundUser, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !foundUser) {
                if (error?.code !== 'PGRST116') { // not found error
                    console.error("Login error:", error);
                }
                return { success: false, error: 'Invalid username or password' };
            }

            // Check if user is already logged in elsewhere
            if (foundUser.is_active) {
                return {
                    success: false,
                    error: 'Cannot log into this account.'
                };
            }

            // Set user to active
            const { error: updateError } = await supabase
                .from('app_users')
                .update({ is_active: true })
                .eq('id', foundUser.id);

            if (updateError) {
                console.error("Failed to update active status:", updateError);
                return { success: false, error: 'Failed to start session. Please try again.' };
            }

            const userData = {
                id: foundUser.id,
                username: foundUser.username,
                name: foundUser.name,
                role: foundUser.role
            };

            localStorage.setItem('auth-user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };

        } catch (err) {
            console.error("Unexpected login error:", err);
            return { success: false, error: 'An unexpected error occurred.' };
        }
    };

    const logout = async () => {
        if (user?.id) {
            // Set user to inactive in database
            await supabase
                .from('app_users')
                .update({ is_active: false })
                .eq('id', user.id);
        }

        localStorage.removeItem('auth-user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
