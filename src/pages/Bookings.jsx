import React, { useState } from 'react';
import { Calendar, User, DollarSign, Plus, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import BookNowModal from '../components/bookings/BookNowModal';
import TerminateBookingModal from '../components/bookings/TerminateBookingModal';
import ClientDetailModal from '../components/clients/ClientDetailModal';
import VehicleDetailModal from '../components/fleet/VehicleDetailModal';
import BookingDocumentsModal from '../components/bookings/BookingDocumentsModal';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers';

import { useNotification } from '../context/NotificationContext';

const Bookings = () => {
    const { bookings, vehicles, clients, addBooking, updateBooking, cancelBooking, updateVehicle, setIsNewBookingModalOpen, isNewBookingModalOpen } = useApp();
    const { showNotification, confirmAction } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingBooking, setEditingBooking] = useState(null);
    const [terminatingBooking, setTerminatingBooking] = useState(null);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
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

    const handleUpdateBooking = async (id, data) => {
        const confirmed = await confirmAction({
            title: t('common.confirmUpdate') || 'Confirm Update',
            message: "Are you sure you want to modify this booking?",
            type: 'warning'
        });

        if (!confirmed) return;

        updateBooking(id, data);
        showNotification(t('bookings.notifications.updated'), 'success');
        setIsNewBookingModalOpen(false);
        setEditingBooking(null);
    };

    const handleTerminateBooking = async (id, data) => {
        await updateBooking(id, data);
        
        // Update the vehicle: set status to 'Available' and set mileage to endingKm
        await updateVehicle(data.vehicleId, {
            status: 'Available',
            mileage: Number(data.endingKm)
        });
        
        showNotification(t('bookings.notifications.terminated') || 'Booking completed successfully!', 'success');
        setIsTerminateModalOpen(false);
        setTerminatingBooking(null);
    };

    const handleCancelBooking = async (booking) => {
        const confirmed = await confirmAction({
            title: t('bookings.cancelBtn'),
            message: t('bookings.cancelConfirm'),
            type: 'danger'
        });

        if (confirmed) {
            cancelBooking(booking.id);
            showNotification(t('bookings.notifications.cancelled'), 'success');
        }
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

    const filteredBookings = (statusFilter === 'All'
        ? bookings
        : statusFilter === 'toTerminate'
            ? bookings.filter(b => isReadyToTerminate(b))
            : bookings.filter(b => b.status === statusFilter))
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown';
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown';
    };

    const statusFilters = ['All', 'Active', 'Upcoming', 'Completed', 'Cancelled', 'toTerminate'];

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
                {statusFilters.map((status) => {
                    const count = status === 'All'
                        ? bookings.length
                        : status === 'toTerminate'
                            ? bookings.filter(b => isReadyToTerminate(b)).length
                            : bookings.filter(b => b.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${statusFilter === status
                                ? 'bg-white text-black shadow-lg'
                                : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                                }`}
                        >
                            <span>{status === 'toTerminate' ? t('bookings.toTerminate') || 'To Terminate' : t(`bookings.${status.toLowerCase()}`)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Bookings Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.vehicle')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.customer')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.dates')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.status')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('bookings.table.total')}</th>
                                <th className="text-right rtl:text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('clients.table.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors group"
                                >
                                    <td className="p-5 text-left rtl:text-right">
                                        <button onClick={() => handleCarClick(booking.vehicleId)} className="text-white hover:underline font-bold text-sm text-left rtl:text-right transition-colors">
                                            {getVehicleName(booking.vehicleId)}
                                        </button>
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        <button onClick={() => handleClientClick(booking.clientId)} className="text-white hover:underline font-bold text-sm text-left rtl:text-right transition-colors">
                                            {getClientName(booking.clientId)}
                                        </button>
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        <div className="flex items-center gap-2 text-theme-secondary text-xs font-bold uppercase tracking-tight">
                                            <Calendar className="w-4 h-4 text-theme-primary opacity-50" />
                                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                        </div>
                                        {booking.startingKm !== undefined && (
                                            <div className="flex flex-col gap-0.5 mt-1.5 text-theme-secondary text-[10px] font-medium tracking-wide">
                                                <div>Start: {booking.startingKm} KM</div>
                                                {booking.endingKm && (
                                                    <>
                                                        <div>End: {booking.endingKm} KM</div>
                                                        <div className="text-emerald-500 font-bold">Traveled: {booking.endingKm - booking.startingKm} KM</div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        {(() => {
                                            const isPastDue = isReadyToTerminate(booking);
                                            const badgeClass = isPastDue
                                                ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                                                : booking.status === 'Active' ? 'bg-theme-primary text-theme-sidebar border-theme'
                                                    : booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
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
                                    <td className="p-5 text-left rtl:text-right">
                                        <div className="flex items-center gap-1 text-theme-primary font-black text-sm">
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
                                                    onClick={() => handleCancelBooking(booking)}
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
                onTerminate={handleTerminateBooking}
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


            <BookingDocumentsModal
                isOpen={isDocsModalOpen}
                onClose={() => { setIsDocsModalOpen(false); setDocsBooking(null); }}
                booking={docsBooking}
            />
        </div>
    );
};

export default Bookings;
