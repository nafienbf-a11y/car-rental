import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const MonthlyBookingsChart = () => {
    const { bookings, theme } = useApp();
    const { t } = useLanguage();

    const [monthOffset, setMonthOffset] = useState(0);

    // Calculate monthly data from real bookings
    const getMonthlyData = () => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const monthlyData = [];

        // Get 6 months based on offset
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (i + monthOffset), 1);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            // Filter bookings for this month
            const monthBookings = bookings.filter(booking => {
                if (!booking) return false;
                const bookingDate = new Date(booking.startDate || booking.createdAt);
                if (isNaN(bookingDate.getTime())) return false;
                return bookingDate.getMonth() === date.getMonth() &&
                    bookingDate.getFullYear() === date.getFullYear();
            });

            const revenue = monthBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

            monthlyData.push({
                month: `${month} '${year.toString().slice(2)}`,
                bookings: monthBookings.length,
                revenue: revenue
            });
        }

        return monthlyData;
    };

    const data = getMonthlyData();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-theme-popover p-4 rounded-xl border border-theme shadow-2xl transition-colors duration-300">
                    <p className="text-theme-secondary text-[10px] uppercase tracking-widest font-bold mb-1">{payload[0].payload.month}</p>
                    <p className="text-theme-primary font-bold">{payload[0].value} {t('dashboard.tooltips.bookings')}</p>
                    <p className="text-brand-blue text-sm font-semibold">{payload[0].payload.revenue.toLocaleString()} MAD</p>
                </div>
            );
        }
        return null;
    };

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#27272a' : '#e2e8f0';
    const axisColor = isDark ? '#52525b' : '#94a3b8';
    const tickColor = isDark ? '#71717a' : '#64748b';
    const cursorColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';

    return (
        <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-2xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-theme-primary">{t('dashboard.monthlyBookings')}</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setMonthOffset(prev => prev + 6)}
                        className="p-1.5 bg-theme-input border border-theme rounded-lg hover:bg-theme-border/50 text-theme-secondary hover:text-theme-primary transition-colors"
                        title="Older"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setMonthOffset(prev => Math.max(0, prev - 6))}
                        disabled={monthOffset === 0}
                        className={`p-1.5 border rounded-lg transition-colors ${
                            monthOffset === 0 
                                ? 'bg-theme-input/50 border-theme text-theme-tertiary cursor-not-allowed'
                                : 'bg-theme-input border border-theme hover:bg-theme-border/50 text-theme-secondary hover:text-theme-primary'
                        }`}
                        title="Newer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke={axisColor}
                        tick={{ fill: tickColor }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <YAxis
                        stroke={axisColor}
                        tick={{ fill: tickColor }}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
                    <Bar
                        dataKey="bookings"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyBookingsChart;
