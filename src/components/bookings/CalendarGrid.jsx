import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDayStatusColor } from '../../utils/availability';

const CalendarGrid = ({
    currentDate,
    setCurrentDate,
    selectionStart,
    selectionEnd,
    onDateClick,
    blockedDates,
    disabled
}) => {
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    disabled={currentDate <= new Date()} // Prevent going back too far
                    type="button"
                    className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-white font-bold text-sm uppercase tracking-wider">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button
                    onClick={handleNextMonth}
                    type="button"
                    className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(i => (
                    <div key={`blank-${i}`} className="aspect-square" />
                ))}
                {days.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const statusClass = getDayStatusColor(date, blockedDates, selectionStart, selectionEnd);

                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const isToday = date.getTime() === today.getTime();
                    const isPast = date < today;

                    if (isPast) {
                        return (
                            <div key={day} className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium text-zinc-700 cursor-not-allowed bg-zinc-950/50">
                                {day}
                            </div>
                        );
                    }

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onDateClick(date)}
                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${statusClass} ${isToday ? 'border border-zinc-600' : ''}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700"></div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-900 border border-zinc-800 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)] bg-[length:6px_6px]"></div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-brand-blue"></div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Selected</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;
