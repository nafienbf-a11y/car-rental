import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const TerminateBookingModal = ({ isOpen, onClose, booking, onTerminate }) => {
    const { t } = useLanguage();
    const { vehicles, clients } = useApp();
    const [endingKm, setEndingKm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (booking) {
            setEndingKm(booking.endingKm || '');
            setError('');
        }
    }, [booking, isOpen]);

    if (!booking) return null;

    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const client = clients.find(c => c.id === booking.clientId) || { name: booking.customer, email: booking.email };
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!endingKm) {
            setError(t('modals.bookNow.errors.endKmRequired') || 'Ending KM is required');
            return;
        }

        if (Number(endingKm) < Number(booking.startingKm)) {
            setError(t('modals.bookNow.errors.endKmLess') || 'Ending KM cannot be less than Starting KM');
            return;
        }

        onTerminate(booking.id, {
            ...booking,
            endingKm: Number(endingKm),
            status: 'Completed'
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('bookings.terminateModalTitle') || 'Terminate Booking'}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4">
                    <h3 className="text-white font-bold mb-4">{t('bookings.bookingDetails') || 'Booking Details'}</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('bookings.table.vehicle')}</label>
                            <p className="text-white font-medium mt-1 opacity-70 cursor-not-allowed">{vehicleName}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('bookings.table.customer')}</label>
                            <p className="text-white font-medium mt-1 opacity-70 cursor-not-allowed">{client.name}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('bookings.table.dates')}</label>
                            <p className="text-white font-medium mt-1 opacity-70 cursor-not-allowed">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('bookings.table.total')}</label>
                            <p className="text-white font-medium mt-1 opacity-70 cursor-not-allowed">{formatCurrency(booking.totalCost)}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('modals.bookNow.startingKm')}</label>
                            <p className="text-white font-medium mt-1 opacity-70 cursor-not-allowed">{booking.startingKm}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                    <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-2">
                        {t('modals.bookNow.endingKm')} *
                    </label>
                    <input
                        type="number"
                        value={endingKm}
                        onChange={(e) => setEndingKm(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-brand-blue transition-colors font-bold text-lg"
                        placeholder="0"
                        required
                        autoFocus
                    />

                    {error && (
                        <div className="mt-3 bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <p className="text-red-400 text-xs font-bold">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose} type="button">
                        {t('modals.common.cancel')}
                    </Button>
                    <Button variant="primary" type="submit" icon={CheckCircle}>
                        {t('bookings.confirmTermination') || 'Confirm Termination'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TerminateBookingModal;
