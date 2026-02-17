import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, Users, DollarSign, History, Menu, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

import { useAuth } from '../../context/AuthContext';


const Sidebar = ({ isOpen, setIsOpen }) => {
    const { t, isRTL } = useLanguage();
    const { logout } = useAuth();

    const navItems = [
        { name: t('nav.dashboard'), path: '/admin', icon: LayoutDashboard },
        { name: t('nav.fleet'), path: '/admin/fleet', icon: Car },
        { name: t('nav.bookings'), path: '/admin/bookings', icon: Calendar },
        { name: t('nav.clients'), path: '/admin/clients', icon: Users },
        { name: t('nav.expenses'), path: '/admin/expenses', icon: DollarSign },
        { name: t('nav.history'), path: '/admin/history', icon: History },
    ];

    const handleOpenCatalog = () => {
        window.open('/#/', '_blank');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 h-screen w-64 bg-[#0a0e27] z-30 transition-transform duration-300
                    ${isRTL ? 'right-0 border-l border-zinc-800' : 'left-0 border-r border-zinc-800'}
                    ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
                    lg:translate-x-0
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src="/gatibi_rental_logo_1.png"
                                alt="Gatibi Rental Logo"
                                className="w-24 h-24 rounded-xl object-contain"
                            />
                            <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium leading-tight text-center">
                                {t('sidebar.tagline')}
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-white text-black font-semibold'
                                        : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-blue' : ''}`} />
                                        <span className="font-medium">{item.name}</span>
                                        {isActive && (
                                            <div
                                                className="ml-auto w-1.5 h-1.5 bg-brand-blue rounded-full"
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800 space-y-2">
                        <button
                            onClick={handleOpenCatalog}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300"
                        >
                            <ExternalLink className="w-5 h-5" />
                            <span className="font-medium">{t('nav.catalog')}</span>
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                        >
                            <span className="font-medium">{t('auth.logout')}</span>
                        </button>

                        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">{t('sidebar.systemStatus')}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                <span className="text-sm text-zinc-300">{t('sidebar.operational')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
