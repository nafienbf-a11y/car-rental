import React, { useState } from 'react';
import { Car, Calendar, DollarSign, Wrench, Globe, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/dashboard/StatCard';
import MonthlyBookingsChart from '../components/dashboard/MonthlyBookingsChart';
import FleetStatusChart from '../components/dashboard/FleetStatusChart';
import DashboardTimeline from '../components/dashboard/DashboardTimeline';
import TerminateBookingModal from '../components/bookings/TerminateBookingModal';
import Button from '../components/common/Button';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useRecentActivity } from '../hooks/useRecentActivity';

const Dashboard = () => {
    const { stats, setIsAddVehicleModalOpen, setIsNewBookingModalOpen, expenses, bookings, vehicles, updateBooking, visitorCount } = useApp();
    const { t, language } = useLanguage();
    const recentActivities = useRecentActivity();
    const [terminatingBooking, setTerminatingBooking] = useState(null);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    // Calculate monthly maintenance costs
    const getMonthlyMaintenance = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
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

    const pendingTerminations = bookings.filter(b => {
        if (b.status !== 'Active') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateObj = new Date(b.endDate);
        endDateObj.setHours(0, 0, 0, 0);
        return today > endDateObj;
    });

    const handleTerminate = (booking) => {
        setTerminatingBooking(booking);
        setIsTerminateModalOpen(true);
    };

    const handleConfirmTerminate = (id, data) => {
        updateBooking(id, data);
        setIsTerminateModalOpen(false);
        setTerminatingBooking(null);
    };

    return (
        <div className="space-y-6">
            {/* Page Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('dashboard.welcome')}</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                    title="Today's Visitors"
                    value={visitorCount}
                    icon={Globe}
                    color="neutral"
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

                {/* Pending Terminations */}
                <div className="bg-theme-sidebar border border-red-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-theme-primary">{t('bookings.pendingTerminations') || 'Pending Terminations'}</h3>
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 font-bold text-xs rounded-full">
                            {pendingTerminations.length}
                        </span>
                    </div>

                    {pendingTerminations.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {pendingTerminations.map((booking) => {
                                const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                                const vName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';

                                return (
                                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <div>
                                            <p className="text-theme-primary font-bold text-sm mb-1">
                                                Terminate booking of {vName}
                                            </p>
                                            <div className="flex items-center gap-2 text-theme-secondary text-xs font-medium">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleTerminate(booking)}
                                            className="text-[10px] uppercase font-bold tracking-widest bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-theme-primary shrink-0"
                                        >
                                            {t('bookings.terminateBtn') || 'Terminate'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-theme-secondary flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-theme-sidebar flex items-center justify-center mb-3">
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium">All caught up! No pending terminations.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyBookingsChart />
                <FleetStatusChart />
            </div>

            {/* Recent Activity */}
            <div className="bg-theme-sidebar border border-theme rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-theme-primary mb-6">{t('dashboard.recentActivity')}</h3>
                {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-50 dark:bg-zinc-800/50 border border-theme rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'vehicle_new' ? 'bg-purple-500' :
                                        activity.type === 'client_new' ? 'bg-emerald-500' :
                                            activity.type === 'booking_new' ? 'bg-brand-blue' :
                                                activity.type === 'booking_cancel' ? 'bg-red-500' :
                                                    activity.type === 'booking_terminate' ? 'bg-orange-500' :
                                                        activity.type === 'expense_new' ? 'bg-yellow-500' :
                                                            'bg-zinc-500'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-theme-primary font-medium">{activity.title}</p>
                                    <p className="text-theme-secondary text-sm font-medium">{activity.message}</p>
                                </div>
                                <span className="text-xs text-theme-secondary font-semibold">{getTimeAgo(activity.date)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-theme-secondary">
                        <p className="text-sm font-medium">{t('dashboard.noActivity')}</p>
                    </div>
                )}
            </div>

            <TerminateBookingModal
                isOpen={isTerminateModalOpen}
                onClose={() => {
                    setIsTerminateModalOpen(false);
                    setTerminatingBooking(null);
                }}
                booking={terminatingBooking}
                onTerminate={handleConfirmTerminate}
            />
        </div>
    );
};

export default Dashboard;
