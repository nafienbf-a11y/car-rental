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
        // Initialize from local storage on mount
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Polling and Unload logic (runs when user changes)
    useEffect(() => {
        if (!user?.id) return;

        // Re-validate session with database to ensure still active
        const checkSession = async () => {
            const { data, error } = await supabase
                .from('app_users')
                .select('is_active, role')
                .eq('id', user.id)
                .single();

            // Force local logout if db says not active or error (e.g. deleted)
            if (error || data?.is_active === false) {
                localStorage.removeItem('auth-user');
                setUser(null);
                setIsAuthenticated(false);
            } else if (data && data.role !== user.role) {
                // Update role if changed
                const updatedUser = { ...user, role: data.role };
                localStorage.setItem('auth-user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        };

        // Run check immediately on mount/login
        checkSession();

        // Then continuously poll every 5 seconds
        const sessionInterval = setInterval(checkSession, 5000);

        // Handle window close/unload to cleanup session
        const handleUnload = () => {
            if (user?.id) {
                // Supabase requests might not finish on unload, but try our best
                supabase.from('app_users').update({ is_active: false }).eq('id', user.id).then();
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(sessionInterval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [user?.id]);

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

            // Check if user is already logged in elsewhere (bypass for super user gatibi)
            if (foundUser.is_active && foundUser.username !== 'gatibi') {
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
