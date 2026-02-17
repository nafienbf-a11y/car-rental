import React, { useState } from 'react';
import { Calendar, User, DollarSign, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import BookNowModal from '../components/bookings/BookNowModal';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers';

import { useNotification } from '../context/NotificationContext';

const Bookings = () => {
    const { bookings, vehicles, addBooking, updateBooking, setIsNewBookingModalOpen, isNewBookingModalOpen } = useApp();
    const { showNotification } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingBooking, setEditingBooking] = useState(null);

    const handleEditBooking = (booking) => {
        setEditingBooking(booking);
        setIsNewBookingModalOpen(true);
    };

    const handleUpdateBooking = (id, data) => {
        updateBooking(id, data);
        showNotification(t('bookings.notifications.updated'), 'success');
        setIsNewBookingModalOpen(false);
        setEditingBooking(null);
    };

    const handleCloseModal = () => {
        setIsNewBookingModalOpen(false);
        setEditingBooking(null);
    };

    const filteredBookings = statusFilter === 'All'
        ? bookings
        : bookings.filter(b => b.status === statusFilter);

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown';
    };

    const statusFilters = ['All', 'Active', 'Completed', 'Cancelled'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">{t('bookings.title')}</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">{t('bookings.subtitle')}</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setIsNewBookingModalOpen(true)}
                >
                    {t('bookings.newBooking')}
                </Button>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 inline-flex gap-1.5 overflow-x-auto max-w-full">
                {statusFilters.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${statusFilter === status
                            ? 'bg-white text-black shadow-lg'
                            : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                            }`}
                    >
                        {t(`bookings.${status.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.id')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.customer')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.vehicle')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.dates')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.status')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {filteredBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-zinc-900/50 transition-colors group"
                                >
                                    <td className="p-5">
                                        <span className="text-zinc-400 font-mono text-xs font-bold">{booking.id}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-all duration-300">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-extrabold text-sm">{booking.customer}</p>
                                                <p className="text-zinc-500 text-xs font-medium tracking-tight">{booking.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-300 font-bold text-sm">{getVehicleName(booking.vehicleId)}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-tight">
                                            <Calendar className="w-4 h-4 text-white opacity-50" />
                                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'Active' ? 'bg-white text-black border-white' :
                                            booking.status === 'Completed' ? 'bg-zinc-900 text-zinc-400 border-zinc-800' :
                                                'bg-brand-red text-white border-brand-red font-semibold'
                                            }`}>
                                            {t(`bookings.${booking.status.toLowerCase()}`)}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1 text-white font-black text-sm">
                                            {formatCurrency(booking.totalCost)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Modal (New & Edit) */}
            <BookNowModal
                isOpen={isNewBookingModalOpen}
                onClose={handleCloseModal}
                onAdd={(booking) => {
                    addBooking(booking);
                    showNotification(t('bookings.notifications.created'), 'success');
                }}
                onUpdate={handleUpdateBooking}
                vehicles={vehicles}
                booking={editingBooking}
            />
        </div>
    );
};

export default Bookings;
