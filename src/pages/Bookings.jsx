import React, { useState } from 'react';
import { Calendar, User, DollarSign, Plus, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import BookNowModal from '../components/bookings/BookNowModal';
import TerminateBookingModal from '../components/bookings/TerminateBookingModal';
import ClientDetailModal from '../components/clients/ClientDetailModal';
import VehicleDetailModal from '../components/fleet/VehicleDetailModal';
import ConfirmModal from '../components/common/ConfirmModal';
import BookingDocumentsModal from '../components/bookings/BookingDocumentsModal';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers';

import { useNotification } from '../context/NotificationContext';

const Bookings = () => {
    const { bookings, vehicles, clients, addBooking, updateBooking, cancelBooking, setIsNewBookingModalOpen, isNewBookingModalOpen } = useApp();
    const { showNotification } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingBooking, setEditingBooking] = useState(null);
    const [terminatingBooking, setTerminatingBooking] = useState(null);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [cancellingBooking, setCancellingBooking] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [docsBooking, setDocsBooking] = useState(null);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

    const handleCarClick = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setIsVehicleModalOpen(true);
        }
    };

    const handleClientClick = (clientId) => {
        if (!clientId) return;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClient(client);
            setIsClientModalOpen(true);
        }
    };

    const handleTerminateClick = (booking) => {
        setTerminatingBooking(booking);
        setIsTerminateModalOpen(true);
    };

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

    const isReadyToTerminate = (booking) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateObj = new Date(booking.endDate);
        endDateObj.setHours(0, 0, 0, 0);
        return booking.status === 'Active' && today > endDateObj;
    };

    const filteredBookings = statusFilter === 'All'
        ? bookings
        : statusFilter === 'toTerminate'
            ? bookings.filter(b => isReadyToTerminate(b))
            : bookings.filter(b => b.status === statusFilter);

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown';
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown';
    };

    const statusFilters = ['All', 'Active', 'Completed', 'Cancelled', 'toTerminate'];

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
                        {status === 'toTerminate' ? t('bookings.toTerminate') || 'To Terminate' : t(`bookings.${status.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Car</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.dates')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.status')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.total')}</th>
                                <th className="text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('clients.table.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {filteredBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-zinc-900/50 transition-colors group"
                                >
                                    <td className="p-5">
                                        <button onClick={() => handleCarClick(booking.vehicleId)} className="text-brand-blue hover:underline font-bold text-sm text-left transition-colors">
                                            {getVehicleName(booking.vehicleId)}
                                        </button>
                                    </td>
                                    <td className="p-5">
                                        <button onClick={() => handleClientClick(booking.clientId)} className="text-brand-blue hover:underline font-bold text-sm text-left transition-colors">
                                            {getClientName(booking.clientId)}
                                        </button>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-tight">
                                            <Calendar className="w-4 h-4 text-white opacity-50" />
                                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {(() => {
                                            const isPastDue = isReadyToTerminate(booking);
                                            const badgeClass = isPastDue
                                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                                : booking.status === 'Active' ? 'bg-white text-black border-white'
                                                    : booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : booking.status === 'Upcoming' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30'
                                                            : 'bg-brand-red/10 text-brand-red border-brand-red/30';
                                            const label = isPastDue
                                                ? (t('bookings.tobeterminated') || 'To be terminated')
                                                : t(`bookings.${booking.status.toLowerCase()}`);
                                            return (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeClass}`}>
                                                    {label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1 text-white font-black text-sm">
                                            {formatCurrency(booking.totalCost)}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.documents && booking.documents.length > 0 && (
                                                <button
                                                    onClick={() => { setDocsBooking(booking); setIsDocsModalOpen(true); }}
                                                    className="p-2 hover:bg-brand-blue/10 rounded-lg text-zinc-400 hover:text-brand-blue transition-colors"
                                                    title={t('bookings.viewDocuments')}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isReadyToTerminate(booking) && (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleTerminateClick(booking)}
                                                    className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5"
                                                >
                                                    {t('bookings.terminateBtn')}
                                                </Button>
                                            )}
                                            {(booking.status === 'Active' || booking.status === 'Upcoming') && (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setCancellingBooking(booking);
                                                        setIsCancelModalOpen(true);
                                                    }}
                                                    className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"
                                                >
                                                    {t('bookings.cancelBtn')}
                                                </Button>
                                            )}
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

            <TerminateBookingModal
                isOpen={isTerminateModalOpen}
                onClose={() => {
                    setIsTerminateModalOpen(false);
                    setTerminatingBooking(null);
                }}
                booking={terminatingBooking}
                onTerminate={handleUpdateBooking}
            />

            <ClientDetailModal
                isOpen={isClientModalOpen}
                onClose={() => { setIsClientModalOpen(false); setSelectedClient(null); }}
                client={selectedClient}
            />

            <VehicleDetailModal
                isOpen={isVehicleModalOpen}
                onClose={() => { setIsVehicleModalOpen(false); setSelectedVehicle(null); }}
                vehicle={selectedVehicle}
            />

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => { setIsCancelModalOpen(false); setCancellingBooking(null); }}
                onConfirm={() => {
                    if (cancellingBooking) {
                        cancelBooking(cancellingBooking.id);
                        showNotification(t('bookings.notifications.cancelled'), 'success');
                    }
                }}
                title={t('bookings.cancelBtn')}
                message={t('bookings.cancelConfirm')}
            />

            <BookingDocumentsModal
                isOpen={isDocsModalOpen}
                onClose={() => { setIsDocsModalOpen(false); setDocsBooking(null); }}
                booking={docsBooking}
            />
        </div>
    );
};

export default Bookings;
