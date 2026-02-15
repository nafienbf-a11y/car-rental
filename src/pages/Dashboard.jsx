import React from 'react';
import { Car, Calendar, DollarSign, Wrench, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/dashboard/StatCard';
import MonthlyBookingsChart from '../components/dashboard/MonthlyBookingsChart';
import FleetStatusChart from '../components/dashboard/FleetStatusChart';
import DashboardTimeline from '../components/dashboard/DashboardTimeline';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
    const { stats, setIsAddVehicleModalOpen, setIsNewBookingModalOpen, bookings, vehicles, expenses } = useApp();

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
                    action: 'New booking',
                    detail: `${vehicleName} - ${booking.customer}`,
                    time: timeAgo,
                    color: 'brand-blue'
                });
            } else if (booking.status === 'Completed') {
                activities.push({
                    action: 'Booking completed',
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

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const recentActivities = getRecentActivity();

    return (
        <div className="space-y-6">
            {/* Page Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Dashboard</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Welcome back! Here's your fleet overview.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        icon={Car}
                        onClick={() => setIsAddVehicleModalOpen(true)}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        Add Car
                    </Button>
                    <Button
                        variant="primary"
                        icon={Calendar}
                        onClick={() => setIsNewBookingModalOpen(true)}
                        className="text-[10px] uppercase tracking-widest"
                    >
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Fleet"
                    value={stats.totalFleet}
                    icon={Car}
                    color="neutral"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats.activeRentals}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title="Monthly Expenses"
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
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
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
                        <p className="text-sm font-medium">No activity yet. Create your first booking to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
