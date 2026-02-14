import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';

const MonthlyBookingsChart = () => {
    const { bookings } = useApp();

    // Calculate monthly data from real bookings
    const getMonthlyData = () => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const monthlyData = [];

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            // Filter bookings for this month
            const monthBookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
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
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-2xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{payload[0].payload.month}</p>
                    <p className="text-white font-bold">{payload[0].value} bookings</p>
                    <p className="text-brand-blue text-sm font-semibold">${payload[0].payload.revenue.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#52525b"
                        tick={{ fill: '#71717a' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                        style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <YAxis
                        stroke="#52525b"
                        tick={{ fill: '#71717a' }}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
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
