import React from 'react';
import Modal from '../common/Modal';
import { Car, Fuel, Settings, Users, CreditCard, Gauge, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/helpers';

const VehicleDetailModal = ({ isOpen, onClose, vehicle }) => {
    const { t } = useLanguage();

    if (!vehicle) return null;

    const statusColor = vehicle.status === 'Available' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
        : vehicle.status === 'Rented' ? 'text-brand-blue bg-brand-blue/10 border-brand-blue/30'
            : 'text-orange-400 bg-orange-500/10 border-orange-500/30';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${vehicle.brand} ${vehicle.model}`} size="lg">
            <div className="space-y-6">
                {/* Vehicle Image */}
                {vehicle.image && (
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                        <img
                            src={vehicle.image}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-56 object-cover"
                        />
                    </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>
                        {vehicle.status}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono uppercase">{vehicle.plate}</span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.brand') || 'Brand'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.brand}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.model') || 'Model'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.model}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.year') || 'Year'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.year}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.price') || 'Price/Day'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{formatCurrency(vehicle.pricePerDay)}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('modals.addVehicle.transmission') || 'Transmission'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm capitalize">{vehicle.transmission || '-'}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Fuel className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('modals.addVehicle.fuel') || 'Fuel'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm capitalize">{vehicle.fuel || '-'}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('modals.addVehicle.seats') || 'Seats'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.seats || '-'}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Gauge className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.mileage') || 'Mileage'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.mileage ? `${vehicle.mileage} km` : '-'}</p>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Wrench className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('fleet.table.lastMaintenance') || 'Last Maintenance'}
                            </span>
                        </div>
                        <p className="text-white font-bold text-sm">{vehicle.lastMaintenance || '-'}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default VehicleDetailModal;
