import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Calendar, Users, DollarSign, History, Menu } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Cars', path: '/fleet', icon: Car },
        { name: 'Bookings', path: '/bookings', icon: Calendar },
        { name: 'Clients', path: '/clients', icon: Users },
        { name: 'Expenses', path: '/expenses', icon: DollarSign },
        { name: 'History', path: '/history', icon: History },
    ];

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
                className={`fixed left-0 top-0 h-screen w-64 bg-[#0a0e27] border-r border-zinc-800 z-30 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">CarRental</h1>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1.5">
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
                    <div className="p-4 border-t border-zinc-800">
                        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">System Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                <span className="text-sm text-zinc-300">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
