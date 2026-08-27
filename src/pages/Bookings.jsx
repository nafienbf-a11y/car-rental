import React, { useState } from 'react';
import { Calendar, User, DollarSign, Plus, FileText, Upload, PenTool } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import BookNowModal from '../components/bookings/BookNowModal';
import TerminateBookingModal from '../components/bookings/TerminateBookingModal';
import ClientDetailModal from '../components/clients/ClientDetailModal';
import VehicleDetailModal from '../components/fleet/VehicleDetailModal';
import BookingDocumentsModal from '../components/bookings/BookingDocumentsModal';
import LegacyImportModal from '../components/bookings/LegacyImportModal';
import ContractModal from '../components/bookings/ContractModal';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers';

import { useNotification } from '../context/NotificationContext';

const Bookings = () => {
    const { bookings, vehicles, clients, getContractByBookingId, addBooking, updateBooking, cancelBooking, updateVehicle, setIsNewBookingModalOpen, isNewBookingModalOpen } = useApp();
    const { showNotification, confirmAction } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [editingBooking, setEditingBooking] = useState(null);
    const [terminatingBooking, setTerminatingBooking] = useState(null);
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [docsBooking, setDocsBooking] = useState(null);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isLegacyImportModalOpen, setIsLegacyImportModalOpen] = useState(false);
    const [contractBooking, setContractBooking] = useState(null);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);

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

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown';
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown';
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th 
            className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-theme-primary transition-colors group"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col">
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▲</span>
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▼</span>
                </div>
            </div>
        </th>
    );

    const getDateFilteredBookings = () => {
        let b = bookings;
        if (startDateFilter) b = b.filter(x => x.startDate >= startDateFilter);
        if (endDateFilter) b = b.filter(x => x.endDate <= endDateFilter);
        return b;
    };

    const dateFilteredBookings = getDateFilteredBookings();

    const filteredBookings = (statusFilter === 'All'
        ? dateFilteredBookings
        : statusFilter === 'toTerminate'
            ? dateFilteredBookings.filter(b => isReadyToTerminate(b))
            : dateFilteredBookings.filter(b => b.status === statusFilter))
        .slice()
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            let aVal = a[key];
            let bVal = b[key];

            if (key === 'vehicleId') {
                aVal = getVehicleName(a.vehicleId).toLowerCase();
                bVal = getVehicleName(b.vehicleId).toLowerCase();
            } else if (key === 'clientId') {
                aVal = getClientName(a.clientId).toLowerCase();
                bVal = getClientName(b.clientId).toLowerCase();
            } else if (key === 'startDate' || key === 'endDate' || key === 'createdAt') {
                aVal = new Date(a[key]).getTime();
                bVal = new Date(b[key]).getTime();
            } else if (key === 'totalCost') {
                aVal = Number(a.totalCost) || 0;
                bVal = Number(b.totalCost) || 0;
            } else {
                aVal = aVal?.toString().toLowerCase() || '';
                bVal = bVal?.toString().toLowerCase() || '';
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1 && itemsPerPage !== 999999) return null;
        if (itemsPerPage === 999999 && filteredBookings.length === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-theme-subcard gap-4 border-t border-theme">
                <span className="text-theme-secondary text-xs font-bold">
                    {t('common.showingEntries', { 
                        start: filteredBookings.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1, 
                        end: Math.min(currentPage * itemsPerPage, filteredBookings.length), 
                        total: filteredBookings.length 
                    })}
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="flex items-center justify-center px-4 py-1 bg-theme-input border border-theme rounded-lg text-theme-primary text-xs font-bold shadow-inner">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        );
    };

    const statusFilters = ['All', 'Active', 'Upcoming', 'Completed', 'Cancelled', 'toTerminate'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('bookings.title')}</h1>
                    <p className="text-theme-secondary font-medium tracking-tight">{t('bookings.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        icon={Upload}
                        onClick={() => setIsLegacyImportModalOpen(true)}
                    >
                        {t('common.importLegacy')}
                    </Button>
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsNewBookingModalOpen(true)}
                    >
                        {t('bookings.newBooking')}
                    </Button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-4 mb-4">
                {/* Status Filter Tabs */}
                <div className="bg-theme-card border border-theme rounded-2xl p-1.5 inline-flex gap-1.5 overflow-x-auto max-w-full">
                    {statusFilters.map((status) => {
                        const count = status === 'All'
                            ? dateFilteredBookings.length
                            : status === 'toTerminate'
                                ? dateFilteredBookings.filter(b => isReadyToTerminate(b)).length
                                : dateFilteredBookings.filter(b => b.status === status).length;
                        return (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${statusFilter === status
                                ? 'bg-brand-blue text-white shadow-lg'
                                : 'text-theme-secondary hover:bg-theme-input hover:text-theme-primary'
                                }`}
                        >
                            <span>{status === 'toTerminate' ? t('bookings.toTerminate') || 'To Terminate' : t(`bookings.${status.toLowerCase()}`)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-white/20 text-white' : 'bg-theme-input text-theme-secondary'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
                </div>

                {/* Date Range & Rows Per Page */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-2xl p-1.5 w-full sm:w-auto overflow-x-auto">
                        <span className="text-theme-secondary text-[10px] font-bold uppercase tracking-widest pl-2 whitespace-nowrap">{t('common.filterDates')}</span>
                        <input 
                            type="date" 
                            value={startDateFilter}
                            onChange={e => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-theme-input border border-theme text-theme-primary rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue"
                        />
                        <span className="text-theme-secondary text-xs font-bold">-</span>
                        <input 
                            type="date" 
                            value={endDateFilter}
                            onChange={e => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                            className="bg-theme-input border border-theme text-theme-primary rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue"
                        />
                        {(startDateFilter || endDateFilter) && (
                            <button 
                                onClick={() => { setStartDateFilter(''); setEndDateFilter(''); setCurrentPage(1); }}
                                className="text-theme-secondary hover:text-theme-primary px-3 py-1.5 text-xs font-bold bg-theme-input hover:bg-theme-border rounded-xl transition-colors"
                            >
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                    
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-2xl p-1.5">
                        <span className="text-theme-secondary text-[10px] font-bold uppercase tracking-widest pl-2">{t('common.showLabel')}</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-theme-input border border-theme text-theme-primary rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue cursor-pointer"
                        >
                            <option value={10}>{t('common.rowsCount', { count: 10 })}</option>
                            <option value={20}>{t('common.rowsCount', { count: 20 })}</option>
                            <option value={50}>{t('common.rowsCount', { count: 50 })}</option>
                            <option value={999999}>{t('common.allRows')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-2xl">
                <div className="border-b border-theme">
                    {renderPagination()}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-theme bg-theme-subcard">
                                <SortableHeader label={t('bookings.table.vehicle')} sortKey="vehicleId" />
                                <SortableHeader label={t('bookings.table.customer')} sortKey="clientId" />
                                <SortableHeader label={t('bookings.table.dates')} sortKey="startDate" />
                                <SortableHeader label={t('bookings.table.status')} sortKey="status" />
                                <SortableHeader label={t('bookings.table.total')} sortKey="totalCost" />
                                <th className="text-right rtl:text-left p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('clients.table.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme">
                            {paginatedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-theme-secondary text-sm font-bold">
                                        No bookings found matching your filters.
                                    </td>
                                </tr>
                            ) : paginatedBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-theme-input/40 transition-colors group"
                                >
                                    <td className="p-5 text-left rtl:text-right">
                                        <button onClick={() => handleCarClick(booking.vehicleId)} className="text-theme-primary hover:underline font-bold text-sm text-left rtl:text-right transition-colors">
                                            {getVehicleName(booking.vehicleId)}
                                        </button>
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        <button onClick={() => handleClientClick(booking.clientId)} className="text-theme-primary hover:underline font-bold text-sm text-left rtl:text-right transition-colors">
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

                                            {/* Contract Button */}
                                            {(() => {
                                                const contract = getContractByBookingId(booking.id);
                                                const isSigned = contract?.status === 'Signed';
                                                return (
                                                    <button
                                                        onClick={() => { setContractBooking(booking); setIsContractModalOpen(true); }}
                                                        className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${
                                                            isSigned 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                                                : contract 
                                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                                                        }`}
                                                        title={isSigned ? t('contract.viewContract') : contract ? t('contract.manageContract') : t('contract.generateContract')}
                                                    >
                                                        <PenTool className="w-3.5 h-3.5" />
                                                        <span className="hidden lg:inline">
                                                            {isSigned ? t('contract.signedLabel') : contract ? t('contract.contractLabel') : t('contract.generateContract')}
                                                        </span>
                                                    </button>
                                                );
                                            })()}

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
                
                {/* Pagination Controls */}
                <div className="border-t border-theme">
                    {renderPagination()}
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

            <LegacyImportModal 
                isOpen={isLegacyImportModalOpen}
                onClose={() => setIsLegacyImportModalOpen(false)}
            />

            <ContractModal
                isOpen={isContractModalOpen}
                onClose={() => { setIsContractModalOpen(false); setContractBooking(null); }}
                booking={contractBooking}
            />
        </div>
    );
};

export default Bookings;
