import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getBlockedDates } from '../../utils/availability';
import { useApp } from '../../context/AppContext';

const DashboardTimeline = () => {
    const { vehicles, bookings } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Today detection
    const now = new Date();
    const todayDay = now.getDate();
    const isCurrentMonth = currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleMonthYearSelect = (month, year) => {
        setCurrentDate(new Date(year, month, 1));
        setShowMonthPicker(false);
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
    };

    // Calculate position and width for a booking bar
    const getBookingStyle = (booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Only show bookings that overlap with current month
        if (end < monthStart || start > monthEnd) return null;

        let startDay = start.getDate();
        let duration = (end - start) / (1000 * 60 * 60 * 24) + 1;

        // Clip start if booking started in previous month
        if (start < monthStart) {
            const offset = (monthStart - start) / (1000 * 60 * 60 * 24);
            duration -= offset;
            startDay = 1;
        }

        // Clip end if booking extends beyond current month
        if (end > monthEnd) {
            const overflow = (end - monthEnd) / (1000 * 60 * 60 * 24);
            duration -= overflow;
        }

        return {
            left: `${((startDay - 1) / daysInMonth) * 100}%`,
            width: `${(duration / daysInMonth) * 100}%`
        };
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Fleet Timeline</h3>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Month/Year Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-bold text-white min-w-[160px] text-center transition-colors flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </button>

                            {showMonthPicker && (
                                <div className="absolute top-full left-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl z-50 min-w-[280px]">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Select Month & Year</p>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {monthNames.map((month, index) => (
                                            <button
                                                key={month}
                                                onClick={() => handleMonthYearSelect(index, currentDate.getFullYear())}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${index === currentDate.getMonth()
                                                    ? 'bg-brand-blue text-white'
                                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                    }`}
                                            >
                                                {month.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {generateYearOptions().map(year => (
                                            <button
                                                key={year}
                                                onClick={() => handleMonthYearSelect(currentDate.getMonth(), year)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${year === currentDate.getFullYear()
                                                    ? 'bg-brand-blue text-white'
                                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                    }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-brand-blue"></div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-brand-red"></div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Maintenance</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row (Days) */}
                    <div className="flex mb-4">
                        <div className="w-32 flex-shrink-0"></div> {/* Spacer for car names */}
                        <div
                            className="flex-1 grid gap-px"
                            style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                        >
                            {days.map(day => {
                                const isToday = isCurrentMonth && day === todayDay;

                                return (
                                    <div key={day} className="text-center relative">
                                        {isToday ? (
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-black shadow-lg shadow-brand-blue/30">
                                                {day}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-600">
                                                {day}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Vehicle Rows */}
                    <div className="space-y-3">
                        {vehicles.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <p className="text-sm font-medium">No vehicles yet. Add your first vehicle to see the timeline.</p>
                            </div>
                        ) : (
                            vehicles.map(vehicle => (
                                <div key={vehicle.id} className="flex items-center group">
                                    {/* Car Info */}
                                    <div className="w-32 flex-shrink-0 pr-4">
                                        <p className="text-xs font-bold text-white truncate">{vehicle.brand} {vehicle.model}</p>
                                        <p className="text-[10px] text-zinc-600 font-mono uppercase truncate">{vehicle.plate}</p>
                                    </div>

                                    {/* Timeline Track */}
                                    <div className={`flex-1 relative h-8 rounded-lg border ${vehicle.status === 'Maintenance'
                                        ? 'bg-red-900/10 border-red-900/30'
                                        : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                        {/* Grid Lines */}
                                        <div
                                            className="absolute inset-0 grid gap-px pointer-events-none"
                                            style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                                        >
                                            {days.map(day => {
                                                const isToday = isCurrentMonth && day === todayDay;
                                                return (
                                                    <div key={day} className={`h-full first:border-l-0 ${isToday
                                                        ? 'bg-brand-blue/15 border-l border-brand-blue/40 border-r border-r-brand-blue/40'
                                                        : 'border-l border-zinc-800/30'
                                                        }`}></div>
                                                );
                                            })}
                                        </div>

                                        {/* Booking Bars */}
                                        {bookings
                                            .filter(b => b.vehicleId === vehicle.id && b.status !== 'Completed' && b.status !== 'Cancelled')
                                            .map(booking => {
                                                const style = getBookingStyle(booking);
                                                if (!style) return null;

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        className="absolute top-1 bottom-1 rounded-md shadow-sm border border-opacity-20 bg-brand-blue/80 border-brand-blue"
                                                        style={style}
                                                        title={`${booking.id}: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`}
                                                    >
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTimeline;
