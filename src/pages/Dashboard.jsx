import React from 'react';
import { Car, Calendar, DollarSign, Wrench, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/dashboard/StatCard';
import MonthlyBookingsChart from '../components/dashboard/MonthlyBookingsChart';
import FleetStatusChart from '../components/dashboard/FleetStatusChart';
import DashboardTimeline from '../components/dashboard/DashboardTimeline';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
    const { stats, setIsAddVehicleModalOpen, setIsNewBookingModalOpen, bookings, vehicles, expenses } = useApp();
    const { t, language } = useLanguage();

    // Calculate monthly maintenance costs
    const getMonthlyMaintenance = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + (expense.amount || 0), 0); // Use .amount not .cost
    };

    // Generate dynamic recent activity
    const getRecentActivity = () => {
        const activities = [];

        // Get recent bookings (last 5)
        const recentBookings = [...bookings]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        recentBookings.forEach(booking => {
            const vehicle = vehicles.find(v => v.id === booking.vehicleId);
            const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
            const timeAgo = getTimeAgo(new Date(booking.createdAt));

            if (booking.status === 'Active') {
                activities.push({
                    action: t('dashboard.newBookingActivity'),
                    detail: `${vehicleName} - ${booking.customer}`,
                    time: timeAgo,
                    color: 'brand-blue'
                });
            } else if (booking.status === 'Completed') {
                activities.push({
                    action: t('dashboard.bookingCompleted'),
                    detail: `${vehicleName} - ${booking.customer}`,
                    time: timeAgo,
                    color: 'zinc-500'
                });
            }
        });

        return activities.slice(0, 4);
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

    const recentActivities = getRecentActivity();

    return (
        <div className="space-y-6">
            {/* Page Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">{t('dashboard.welcome')}</h2>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        icon={Car}
                        onClick={() => setIsAddVehicleModalOpen(true)}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        {t('dashboard.addCar')}
                    </Button>
                    <Button
                        variant="primary"
                        icon={Calendar}
                        onClick={() => setIsNewBookingModalOpen(true)}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        {t('dashboard.newBooking')}
                    </Button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.totalFleet')}
                    value={stats.totalFleet}
                    icon={Car}
                    color="neutral"
                />
                <StatCard
                    title={t('dashboard.activeRentals')}
                    value={stats.activeRentals}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title={t('dashboard.monthlyRevenue')}
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title={t('dashboard.monthlyExpenses')}
                    value={formatCurrency(getMonthlyMaintenance())}
                    icon={Wrench}
                    color="red"
                />
            </div>

            {/* Charts Grid */}
            <div className="flex flex-col gap-6">
                <DashboardTimeline />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MonthlyBookingsChart />
                    <FleetStatusChart />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">{t('dashboard.recentActivity')}</h3>
                {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors">
                                <div className={`w-2 h-2 rounded-full ${activity.color === 'brand-blue' ? 'bg-brand-blue' : activity.color === 'brand-red' ? 'bg-brand-red' : 'bg-zinc-500'}`} />
                                <div className="flex-1">
                                    <p className="text-zinc-200 font-medium">{activity.action}</p>
                                    <p className="text-zinc-500 text-sm font-medium">{activity.detail}</p>
                                </div>
                                <span className="text-xs text-zinc-500 font-semibold">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-500">
                        <p className="text-sm font-medium">{t('dashboard.noActivity')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
