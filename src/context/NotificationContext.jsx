import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        const saved = localStorage.getItem('read_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('read_notifications', JSON.stringify(readNotificationIds));
    }, [readNotificationIds]);

    const markAsRead = (id) => {
        setReadNotificationIds(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const markAllAsRead = (ids) => {
        setReadNotificationIds(prev => {
            const newIds = ids.filter(id => !prev.includes(id));
            return [...prev, ...newIds];
        });
    };

    const showNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ message, type });

        if (duration) {
            setTimeout(() => {
                setNotification(null);
            }, duration);
        }
    };

    const hideNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification, readNotificationIds, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
