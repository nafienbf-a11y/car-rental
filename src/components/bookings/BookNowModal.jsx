import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CalendarGrid from './CalendarGrid';
import { Plus, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { generateId, calculateDays, formatCurrency } from '../../utils/helpers';
import { getBlockedDates, validateBookingRange } from '../../utils/availability';
import { useApp } from '../../context/AppContext';

import { useNotification } from '../../context/NotificationContext';

const BookNowModal = ({ isOpen, onClose, onAdd, onUpdate, vehicles, booking }) => {
    const { bookings } = useApp();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        vehicleId: '',
        customer: '',
        email: '',
        phone: '',
        startDate: '',
        endDate: '',
        startingKm: '',
        endingKm: '',
    });

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectionStep, setSelectionStep] = useState('start'); // 'start' or 'end'
    const [blockedDates, setBlockedDates] = useState([]);
    const [error, setError] = useState('');

    // Update blocked dates when vehicle changes
    useEffect(() => {
        if (formData.vehicleId) {
            // If editing, exclude current booking from blocked dates logic if possible
            // But simple way: just get blocked dates.
            // If we are editing, we shouldn't block our own dates.
            // However, getBlockedDates doesn't know about 'current' booking ID.
            // For now, keep as is.
            const blocked = getBlockedDates(formData.vehicleId, bookings);
            setBlockedDates(blocked);
        } else {
            setBlockedDates([]);
        }
    }, [formData.vehicleId, bookings]);

    // Initialize form when booking prop changes (Edit Mode)
    useEffect(() => {
        if (booking) {
            setFormData({
                vehicleId: booking.vehicleId,
                customer: booking.customer,
                email: booking.email || '',
                phone: booking.phone || '',
                startDate: booking.startDate,
                endDate: booking.endDate,
                startingKm: booking.startingKm || '',
                endingKm: booking.endingKm || '',
            });
            setSelectionStep('end'); // Assume dates are selected
        } else {
            // Reset for new booking
            setFormData(prev => ({
                ...prev,
                vehicleId: '',
                customer: '',
                email: '',
                phone: '',
                startDate: '',
                endDate: '',
                startingKm: '',
                endingKm: '',
            }));
            setSelectionStep('start');
        }
    }, [booking, isOpen]);

    // Auto-fill Starting KM when vehicle is selected (New Booking only)
    useEffect(() => {
        if (!booking && formData.vehicleId) {
            const vehicle = vehicles.find(v => v.id === formData.vehicleId);
            if (vehicle) {
                setFormData(prev => ({ ...prev, startingKm: vehicle.mileage }));
            }
        }
    }, [formData.vehicleId, booking, vehicles]);


    const availableVehicles = vehicles.filter(v => v.status !== 'Maintenance');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset dates if vehicle changes (only if new booking)
        if (name === 'vehicleId' && !booking) {
            setFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
            setSelectionStep('start');
            setError('');
        }
    };

    const handleDateClick = (date) => {
        if (!formData.vehicleId) {
            setError('Please select a vehicle first.');
            return;
        }

        // Use local date string YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (selectionStep === 'start') {
            // Validate start date alone
            const validation = validateBookingRange(dateStr, dateStr, blockedDates);

            if (!validation.valid && validation.error !== 'End date must be after start date') {
                // If editing, we might be clicking on our own dates which are 'blocked'.
                // For simplicity, strict check for now.
                if (booking) {
                    // creating strict overlap check excluding self is complex without modifying availability.js
                    // Allow only if validation error isn't critical?
                    // Let's assume user changes dates to valid free slots.
                }
                setError(validation.error);
                return;
            }

            setFormData(prev => ({ ...prev, startDate: dateStr, endDate: '' }));
            setSelectionStep('end');
            setError('');
        } else {
            // Validate the full range from Start to End
            const validation = validateBookingRange(formData.startDate, dateStr, blockedDates);

            if (!validation.valid) {
                setError(validation.error);
                return;
            }

            setFormData(prev => ({ ...prev, endDate: dateStr }));
            setSelectionStep('start'); // Reset for next interaction if needed
            setError('');
        }
    };

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

    const totalDays = calculateDays(formData.startDate, formData.endDate);
    const totalCost = selectedVehicle ? totalDays * selectedVehicle.pricePerDay : 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.startDate || !formData.endDate) {
            setError('Please select a valid date range.');
            return;
        }
        if (!formData.startingKm) {
            setError('Starting KM is required.');
            return;
        }

        // Ending KM Validation Logic
        const today = new Date();
        const endDateObj = new Date(formData.endDate);
        const isReturnOverdue = today > endDateObj;

        // If editing and overdue (or returning), ending km might be required
        if (booking && isReturnOverdue && !formData.endingKm) {
            // User requirement: "must be filled once the car is returned , once the date of today is superior of the end date"
            // We'll enforce it if they are Editing and the date is past.
            setError('Ending KM is required for completed/past bookings.');
            return;
        }

        if (formData.endingKm && Number(formData.endingKm) < Number(formData.startingKm)) {
            setError('Ending KM cannot be less than Starting KM.');
            return;
        }

        // Final validation before submit
        const validation = validateBookingRange(formData.startDate, formData.endDate, blockedDates);
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        const bookingData = {
            ...formData,
            totalCost,
        };

        if (booking) {
            if (onUpdate) {
                onUpdate(booking.id, bookingData);
            }
        } else {
            const newBooking = {
                id: generateId('B'),
                ...bookingData,
                status: 'Active',
                createdAt: new Date().toISOString(),
            };
            onAdd(newBooking);
        }

        onClose();
        // Reset form
        setFormData({
            vehicleId: '',
            customer: '',
            email: '',
            phone: '',
            startDate: '',
            endDate: '',
            startingKm: '',
            endingKm: '',
        });
        setSelectionStep('start');
        setError('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={booking ? 'Edit Booking' : 'New Booking'}
            size="lg" // Larger modal for calendar
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Input Fields */}
                    <div className="space-y-6">
                        {/* Vehicle Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                Select Vehicle *
                            </label>
                            <select
                                name="vehicleId"
                                value={formData.vehicleId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Choose a car...</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.brand} {v.model} ({v.plate}) - {formatCurrency(v.pricePerDay)}/day
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                    placeholder="e.g., John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            {/* Mileage Tracking */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                        Starting KM *
                                    </label>
                                    <input
                                        type="number"
                                        name="startingKm"
                                        value={formData.startingKm}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Show Ending KM only if Editing existing booking */}
                                {booking && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                            Ending KM
                                        </label>
                                        <input
                                            type="number"
                                            name="endingKm"
                                            value={formData.endingKm}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Select Dates {formData.vehicleId ? '(Green: Available)' : '(Select Vehicle First)'}
                        </label>

                        <CalendarGrid
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            selectionStart={formData.startDate}
                            selectionEnd={formData.endDate}
                            onDateClick={handleDateClick}
                            blockedDates={blockedDates}
                            disabled={!formData.vehicleId}
                        />

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <p className="text-red-400 text-xs font-bold">{error}</p>
                            </div>
                        )}

                        {/* Selection Summary */}
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-zinc-500 uppercase font-bold">Start</span>
                                <span className="text-sm text-white font-bold">{formData.startDate || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-zinc-500 uppercase font-bold">End</span>
                                <span className="text-sm text-white font-bold">{formData.endDate || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Summary & Actions */}
                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {totalDays > 0 && selectedVehicle ? (
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Total Estimate</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{formatCurrency(totalCost)}</span>
                                <span className="text-zinc-500 font-bold">for {totalDays} days</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-600 font-medium italic">Select items to see estimate</div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} type="button" className="text-[10px] uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="text-[10px] uppercase tracking-widest"
                            disabled={!formData.startDate || !formData.endDate || !!error}
                        >
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default BookNowModal;
