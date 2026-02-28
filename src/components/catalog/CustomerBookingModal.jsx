import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CalendarGrid from '../bookings/CalendarGrid';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { calculateDays, formatCurrency, generateId } from '../../utils/helpers';
import { getBlockedDates, validateBookingRange } from '../../utils/availability';
import { useApp } from '../../context/AppContext';
import { Check, CreditCard, Calendar as CalendarIcon, Car, Info, ShieldCheck } from 'lucide-react';

const ADDONS = [
    { id: 'childSeat', priceType: 'per_day', price: 100 },
    { id: 'additionalDriver', priceType: 'per_trip', price: 200 },
    { id: 'unlimitedKm', priceType: 'per_day', price: 300 }
];

const CustomerBookingModal = ({ isOpen, onClose, vehicle }) => {
    const { t, isRTL } = useLanguage();
    const { bookings, setBookings } = useApp(); // Need a way to add booking, but since we're customer facing, maybe we just simulate for now. Wait, useApp provides context.
    const { showNotification } = useNotification();

    const [step, setStep] = useState(1); // 1: Dates, 2: Addons & Details, 3: Payment

    // Dates
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [blockedDates, setBlockedDates] = useState([]);
    const [dateError, setDateError] = useState('');

    // Addons
    const [selectedAddons, setSelectedAddons] = useState([]);

    // Customer Details
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (isOpen && vehicle) {
            setBlockedDates(getBlockedDates(vehicle.id, bookings));
            setStep(1);
            setStartDate('');
            setEndDate('');
            setSelectedAddons([]);
            setCustomerInfo({ name: '', email: '', phone: '' });
            setDateError('');
        }
    }, [isOpen, vehicle, bookings]);

    const handleDateClick = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (!startDate || (startDate && endDate)) {
            const validation = validateBookingRange(dateStr, dateStr, blockedDates);
            if (!validation.valid && validation.error !== 'End date must be after start date') {
                setDateError(validation.error);
                return;
            }
            setStartDate(dateStr);
            setEndDate('');
            setDateError('');
        } else {
            const validation = validateBookingRange(startDate, dateStr, blockedDates);
            if (!validation.valid) {
                setDateError(validation.error);
                return;
            }
            setEndDate(dateStr);
            setDateError('');
        }
    };

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev =>
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        );
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const totalDays = calculateDays(startDate, endDate) || 0;
    const basePrice = vehicle ? totalDays * Number(vehicle.pricePerDay || vehicle.price_per_day) : 0;

    const addonsCost = selectedAddons.reduce((sum, addonId) => {
        const addon = ADDONS.find(a => a.id === addonId);
        if (addon.priceType === 'per_day') return sum + (addon.price * totalDays);
        return sum + addon.price;
    }, 0);

    // Early booking discount - e.g., 10% if booked at least 7 days in advance
    let isEarlyBooking = false;
    let discount = 0;
    if (startDate) {
        const today = new Date();
        const start = new Date(startDate);
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
            isEarlyBooking = true;
            discount = (basePrice + addonsCost) * 0.1;
        }
    }

    const finalTotal = basePrice + addonsCost - discount;

    const handleNext = () => {
        if (step === 1 && startDate && endDate) setStep(2);
        else if (step === 2 && customerInfo.name && customerInfo.phone) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePayment = () => {
        // Simulate payment success and booking creation
        setTimeout(() => {
            showNotification(t('catalog.bookingSuccess'), 'success');
            onClose();
        }, 1500);
    };

    if (!vehicle) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('catalog.bookTitle')} size="xl">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-brand-blue' : 'text-zinc-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-brand-blue text-white' : 'bg-zinc-800'}`}>1</div>
                    <span className="text-xs font-semibold">{t('catalog.stepDates')}</span>
                </div>
                <div className="h-[2px] flex-1 bg-zinc-800 mx-4"><div className={`h-full bg-brand-blue transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} /></div>
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-brand-blue' : 'text-zinc-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-brand-blue text-white' : 'bg-zinc-800'}`}>2</div>
                    <span className="text-xs font-semibold">{t('catalog.stepDetails')}</span>
                </div>
                <div className="h-[2px] flex-1 bg-zinc-800 mx-4"><div className={`h-full bg-brand-blue transition-all ${step >= 3 ? 'w-full' : 'w-0'}`} /></div>
                <div className={`flex flex-col items-center ${step >= 3 ? 'text-brand-blue' : 'text-zinc-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-brand-blue text-white' : 'bg-zinc-800'}`}>3</div>
                    <span className="text-xs font-semibold">{t('catalog.stepPayment')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">{t('catalog.selectDatesText')}</h3>
                            <CalendarGrid
                                currentDate={currentDate}
                                setCurrentDate={setCurrentDate}
                                selectionStart={startDate}
                                selectionEnd={endDate}
                                onDateClick={handleDateClick}
                                blockedDates={blockedDates}
                            />
                            {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">{t('catalog.addonsTitle')}</h3>
                                <div className="space-y-3">
                                    {ADDONS.map(addon => (
                                        <div
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedAddons.includes(addon.id) ? 'bg-brand-blue/10 border-brand-blue' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedAddons.includes(addon.id) ? 'bg-brand-blue' : 'border border-zinc-600'}`}>
                                                    {selectedAddons.includes(addon.id) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{t(`catalog.addons.${addon.id}`)}</p>
                                                    <p className="text-zinc-400 text-sm">{addon.priceType === 'per_day' ? t('catalog.perDay') : t('catalog.perTrip')}</p>
                                                </div>
                                            </div>
                                            <span className="text-brand-blue font-bold">+{addon.price} MAD</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">{t('catalog.customerInfo')}</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerChange}
                                        placeholder={t('catalog.fullName')}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleCustomerChange}
                                        placeholder={t('catalog.email')}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerChange}
                                        placeholder={t('catalog.phoneField')}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-brand-blue/50 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">{t('catalog.paymentDetails')}</h3>
                            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-3 mb-6 relative">
                                    <ShieldCheck className="w-6 h-6 text-green-500" />
                                    <span className="text-white font-medium">{t('catalog.securePayment')}</span>
                                    <div className="absolute top-0 right-0 gap-2 flex">
                                        {/* Mocking Stripe/Visa icons */}
                                        <div className="px-2 py-1 bg-white rounded text-blue-900 font-bold text-xs italic">VISA</div>
                                        <div className="px-2 py-1 bg-[#003087] rounded text-white font-bold text-xs italic">PayPal</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input type="text" placeholder={t('catalog.cardNumber')} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white" />
                                        <input type="text" placeholder="CVC" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden sticky top-0">
                        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex gap-4">
                            <img src={vehicle.image} alt={vehicle.brand} className="w-20 h-16 object-contain" />
                            <div>
                                <h4 className="text-white font-bold">{vehicle.brand} {vehicle.model}</h4>
                                <p className="text-zinc-400 text-sm">{vehicle.pricePerDay || vehicle.price_per_day} MAD / {t('catalog.day')}</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t('catalog.summary')}</h4>

                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-300">{totalDays} {t('catalog.days')}</span>
                                <span className="text-white font-semibold">{basePrice} MAD</span>
                            </div>

                            {selectedAddons.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                                    {selectedAddons.map(id => {
                                        const ad = ADDONS.find(a => a.id === id);
                                        const c = ad.priceType === 'per_day' ? ad.price * totalDays : ad.price;
                                        return (
                                            <div key={id} className="flex justify-between text-sm">
                                                <span className="text-zinc-400 w-32 truncate">{t(`catalog.addons.${id}`)}</span>
                                                <span className="text-white">{c} MAD</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {isEarlyBooking && (
                                <div className="flex justify-between text-sm pt-2 border-t border-zinc-800/50 text-green-400">
                                    <span>{t('catalog.earlyDiscount')} (-10%)</span>
                                    <span>-{discount.toFixed(0)} MAD</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-4 border-t border-zinc-800 mt-4">
                                <span className="text-zinc-400 uppercase font-bold text-xs">{t('catalog.total')}</span>
                                <span className="text-2xl font-black text-brand-blue">{finalTotal.toFixed(0)} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between">
                <Button variant="ghost" onClick={step === 1 ? onClose : handleBack}>
                    {step === 1 ? t('modals.common.cancel') : t('catalog.back')}
                </Button>
                {step < 3 ? (
                    <Button variant="primary" onClick={handleNext} disabled={step === 1 && (!startDate || !endDate) || step === 2 && (!customerInfo.name || !customerInfo.phone)}>
                        {t('catalog.next')}
                    </Button>
                ) : (
                    <Button variant="primary" onClick={handlePayment} className="bg-green-600 hover:bg-green-700">
                        {t('catalog.payNow')}
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default CustomerBookingModal;
