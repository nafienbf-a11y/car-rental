import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';

const Topbar = ({ onMenuClick }) => {

    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    // Notifications Logic
    const activities = useRecentActivity();
    const { readNotificationIds, markAsRead, markAllAsRead } = useNotification();

    // Filter unread notifications
    const notifications = activities.filter(activity => !readNotificationIds.includes(activity.id));
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
        <header className="bg-black border-b border-zinc-800 sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left section */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    <LanguageSelector />

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                        >
                            <Bell className="w-6 h-6 text-zinc-400" />
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
                                <div className="absolute right-0 mt-2 w-80 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800 z-20 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-semibold text-white">{t('notifications.title')}</h3>
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
                                                    className="p-4 border-b border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer bg-zinc-900/30"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notif.type === 'booking_new' ? 'bg-brand-blue' :
                                                            notif.type === 'booking_start' ? 'bg-emerald-500' :
                                                                notif.type === 'booking_end' ? 'bg-orange-500' :
                                                                    'bg-zinc-500'
                                                            }`} />
                                                        <div>
                                                            <p className="text-sm text-zinc-200">{notif.title}</p>
                                                            <p className="text-xs text-zinc-400 mt-0.5">{notif.message}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1">{getTimeAgo(notif.date)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-zinc-500">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">{t('notifications.empty')}</p>
                                            </div>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="p-3 text-center border-t border-zinc-800">
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
                    <div className={`flex items-center gap-3 ${language === 'ar' ? 'pr-4 border-r' : 'pl-4 border-l'} border-zinc-800`}>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-zinc-500 font-medium capitalize">{user?.role || 'user'}</p>
                        </div>
                        <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center border border-zinc-800">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
