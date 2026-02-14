import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Topbar = ({ onMenuClick }) => {
    const { stats } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, text: 'New booking from John Doe', time: '5 min ago', unread: true },
        { id: 2, text: 'Vehicle C005 requires maintenance', time: '1 hour ago', unread: true },
        { id: 3, text: 'Payment received: $750', time: '2 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

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
                                <div className="absolute right-0 mt-2 w-80 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800 z-20">
                                    <div className="p-4 border-b border-zinc-800">
                                        <h3 className="font-semibold text-white">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-zinc-800 hover:bg-zinc-900 transition-colors ${notif.unread ? 'bg-zinc-900/50' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notif.unread ? 'bg-brand-blue' : 'bg-transparent'}`} />
                                                    <div>
                                                        <p className="text-sm text-zinc-200">{notif.text}</p>
                                                        <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-zinc-800">
                                        <button className="text-sm text-brand-blue hover:underline">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Admin Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">Admin User</p>
                            <p className="text-xs text-zinc-500 font-medium">Manager</p>
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
