import React, { useState } from 'react';
import { Menu, Bell, User, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';

const Topbar = ({ onMenuClick }) => {

    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    // Notifications Logic
    const { auditLogs, theme, toggleTheme } = useApp();
    const { readNotificationIds, markAsRead, markAllAsRead } = useNotification();

    // Filter unread notifications mapped from audit logs
    const notifications = (auditLogs || []).map(log => {
        let title = '';
        if (log.action_type === 'CREATE') {
            title = t('activity.newVehicle') || `New ${log.entity_type.toLowerCase()}`;
            if (log.entity_type === 'CLIENT') title = t('activity.newClient') || 'New Client';
            if (log.entity_type === 'BOOKING') title = t('activity.newBooking') || 'New Booking';
            if (log.entity_type === 'EXPENSE') title = 'New Expense';
        } else if (log.action_type === 'CANCEL') {
            title = 'Cancelled Booking';
        } else if (log.action_type === 'TERMINATE') {
            title = 'Completed Booking';
        } else {
            title = `Updated ${log.entity_type.toLowerCase()}`;
        }
        
        return {
            id: `audit-${log.id}`,
            type: `${log.action_type.toLowerCase()}_${log.entity_type.toLowerCase()}`,
            date: new Date(log.created_at),
            title: title.charAt(0).toUpperCase() + title.slice(1),
            message: `${log.details} - by ${log.performed_by || 'System'}`
        };
    }).filter(notif => !readNotificationIds.includes(notif.id)).slice(0, 10);

    const unreadCount = notifications.length;

    const handleMarkAllRead = () => {
        markAllAsRead(notifications.map(n => n.id));
        setShowNotifications(false);
    };

    const handleNotificationClick = (id) => {
        markAsRead(id);
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (language === 'ar') {
            if (days > 0) return `${t('dashboard.ago')} ${days} ${t(days === 1 ? 'dashboard.day' : 'dashboard.days')}`;
            if (hours > 0) return `${t('dashboard.ago')} ${hours} ${t(hours === 1 ? 'dashboard.hour' : 'dashboard.hours')}`;
            if (minutes > 0) return `${t('dashboard.ago')} ${minutes} ${t(minutes === 1 ? 'dashboard.minute' : 'dashboard.minutes')}`;
        }

        if (days > 0) return `${days} ${t(days === 1 ? 'dashboard.day' : 'dashboard.days')} ${t('dashboard.ago')}`;
        if (hours > 0) return `${hours} ${t(hours === 1 ? 'dashboard.hour' : 'dashboard.hours')} ${t('dashboard.ago')}`;
        if (minutes > 0) return `${minutes} ${t(minutes === 1 ? 'dashboard.minute' : 'dashboard.minutes')} ${t('dashboard.ago')}`;
        return t('dashboard.justNow');
    };

    return (
        <header className="bg-theme-topbar border-b border-theme sticky top-0 z-10 transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left section */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-theme-input rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-theme-secondary" />
                    </button>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    <LanguageSelector />

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-theme-input rounded-lg text-theme-secondary hover:text-theme-primary transition-all duration-300"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-indigo-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-theme-input rounded-lg transition-colors"
                        >
                            <Bell className="w-6 h-6 text-theme-secondary" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-theme-popover rounded-xl shadow-2xl border border-theme z-20 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                    <div className="p-4 border-b border-theme flex justify-between items-center">
                                        <h3 className="font-semibold text-theme-primary">{t('notifications.title')}</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-brand-blue hover:text-blue-400 font-medium"
                                            >
                                                {t('notifications.markAllRead')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {unreadCount > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif.id)}
                                                    className="p-4 border-b border-theme hover:bg-theme-input transition-colors cursor-pointer bg-theme-input/20"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notif.type === 'booking_new' ? 'bg-brand-blue' :
                                                            notif.type === 'booking_start' ? 'bg-emerald-500' :
                                                                notif.type === 'booking_end' ? 'bg-orange-500' :
                                                                    'bg-zinc-500'
                                                            }`} />
                                                        <div>
                                                            <p className="text-sm text-theme-primary">{notif.title}</p>
                                                            <p className="text-xs text-theme-secondary mt-0.5">{notif.message}</p>
                                                            <p className="text-[10px] text-theme-tertiary mt-1">{getTimeAgo(notif.date)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-theme-tertiary">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">{t('notifications.empty')}</p>
                                            </div>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="p-3 text-center border-t border-theme">
                                            <button className="text-sm text-brand-blue hover:underline">
                                                {t('notifications.viewAll')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Admin Profile */}
                    <div className={`flex items-center gap-3 ${language === 'ar' ? 'pr-4 border-r' : 'pl-4 border-l'} border-theme`}>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-theme-primary">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-theme-tertiary font-medium capitalize">{user?.role || 'user'}</p>
                        </div>
                        <div className="w-10 h-10 bg-theme-input text-theme-primary rounded-xl flex items-center justify-center border border-theme">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
