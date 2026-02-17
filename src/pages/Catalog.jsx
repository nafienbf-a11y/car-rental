import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Users, Gauge, MessageCircle, Car, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/common/LanguageSelector';
import Logo from '../components/common/Logo';

const WHATSAPP_NUMBER = '212763296157';

const Catalog = () => {
    const { vehicles, loading } = useApp();
    const { t, isRTL } = useLanguage();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [transmissionFilter, setTransmissionFilter] = useState('all');
    const [maxPrice, setMaxPrice] = useState('');

    const allVehicles = vehicles;

    const filteredVehicles = allVehicles.filter(v => {
        const matchesSearch =
            `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
        const matchesTransmission = transmissionFilter === 'all' || v.transmission === transmissionFilter;
        const price = v.pricePerDay || v.price_per_day;
        const matchesPrice = !maxPrice || Number(price) <= Number(maxPrice);
        return matchesSearch && matchesCategory && matchesTransmission && matchesPrice;
    });

    const categories = [...new Set(allVehicles.map(v => v.category))];

    const handleWhatsApp = (vehicle) => {
        const message = t('catalog.whatsappMessage')
            .replace('{brand}', vehicle.brand)
            .replace('{model}', vehicle.model)
            .replace('{year}', vehicle.year)
            .replace('{price}', vehicle.pricePerDay || vehicle.price_per_day);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a0e27]/80 backdrop-blur-xl border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="w-10 h-10" showText={false} />
                        <h1 className="text-lg font-bold text-white hidden sm:block">Gatibi Rental</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-36">
                            <LanguageSelector />
                        </div>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('catalog.contactUs')}</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 sm:py-24 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                            <Car className="w-4 h-4" />
                            {t('catalog.badge')}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
                            {t('catalog.heroTitle')}
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            {t('catalog.heroSubtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('catalog.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                        />
                    </div>
                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">{t('catalog.allCategories')}</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {/* Transmission Filter */}
                    <select
                        value={transmissionFilter}
                        onChange={(e) => setTransmissionFilter(e.target.value)}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">{t('catalog.allTransmissions')}</option>
                        <option value="Automatic">{t('catalog.automatic')}</option>
                        <option value="Manual">{t('catalog.manual')}</option>
                    </select>
                    {/* Price Filter */}
                    <div className="relative">
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder={t('catalog.maxPrice')}
                            min="0"
                            className="w-full sm:w-40 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none"
                        />
                    </div>
                </div>
            </section>

            {/* Vehicle Count */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
                <p className="text-zinc-400 text-sm">
                    {t('catalog.showing')} <span className="text-white font-semibold">{filteredVehicles.length}</span> {t('catalog.vehicles')}
                </p>
            </section>

            {/* Vehicle Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                {filteredVehicles.length === 0 ? (
                    <div className="text-center py-20">
                        <Car className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg">{t('catalog.noVehicles')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredVehicles.map((vehicle, index) => (
                                <motion.div
                                    key={vehicle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ y: -6 }}
                                    className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 group"
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden bg-zinc-900">
                                        <img
                                            src={vehicle.image}
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium backdrop-blur-sm">
                                            {t('catalog.available')}
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <p className="text-white font-bold text-lg">{vehicle.brand} {vehicle.model}</p>
                                            <p className="text-zinc-400 text-sm">{vehicle.year}</p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-5">
                                        {/* Specs */}
                                        <div className="grid grid-cols-3 gap-3 mb-5">
                                            <div className="flex flex-col items-center gap-1 p-2.5 bg-zinc-900 rounded-xl">
                                                <Fuel className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs text-zinc-400">{vehicle.fuel}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 p-2.5 bg-zinc-900 rounded-xl">
                                                <Users className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs text-zinc-400">{vehicle.seats} {t('catalog.seats')}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 p-2.5 bg-zinc-900 rounded-xl">
                                                <Gauge className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs text-zinc-400">{vehicle.transmission === 'Automatic' ? t('catalog.automatic') : t('catalog.manual')}</span>
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-white">
                                                    {vehicle.pricePerDay || vehicle.price_per_day} <span className="text-sm font-normal text-zinc-500">MAD/{t('catalog.day')}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleWhatsApp(vehicle)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {t('catalog.rentNow')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Location Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white mb-3">{t('catalog.locationTitle')}</h2>
                    <p className="text-zinc-400 text-lg">{t('catalog.locationSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Map */}
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl h-80 lg:h-auto">
                        <iframe
                            title="Gatibi Rental Location"
                            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3000!2d-5.3748333!3d35.5658889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzXCsDMzJzU3LjIiTiA1wrAyMicyOS40Ilc!5e0!3m2!1sen!2sma!4v1700000000000"
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '320px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    {/* Info Card */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-center gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Gatibi Rental</h3>
                            <p className="text-zinc-400 leading-relaxed">{t('catalog.locationDescription')}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t('catalog.address')}</p>
                                    <p className="text-zinc-400 text-sm">35°33'57.2"N 5°22'29.4"W</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t('catalog.phone')}</p>
                                    <p className="text-zinc-400 text-sm">+212 763-296157</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t('catalog.hours')}</p>
                                    <p className="text-zinc-400 text-sm">{t('catalog.hoursValue')}</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://www.google.com/maps/search/?api=1&query=35.5658889,-5.3748333"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-600 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('catalog.getDirections')}
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-800 py-8 text-center">
                <p className="text-zinc-500 text-sm">&copy; 2026 Gatibi Rental. {t('catalog.allRightsReserved')}</p>
            </footer>
        </div>
    );
};

export default Catalog;
