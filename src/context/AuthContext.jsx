import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ADMIN_USERS = [
    { username: 'gatibi', password: 'gatibi123', name: 'Gatibi Admin', role: 'admin' },
    { username: 'admin', password: 'admin123', name: 'Admin', role: 'admin' },
];

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
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const found = ADMIN_USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (found) {
            const userData = { username: found.username, name: found.name, role: found.role };
            localStorage.setItem('auth-user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        }

        return { success: false, error: 'Invalid username or password' };
    };

    const logout = () => {
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
