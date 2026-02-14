import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, Users, Gauge, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Button from '../common/Button';

const VehicleCard = ({ vehicle, onMaintenance, onAvailable, onEdit, onDelete }) => {
    const getTransmissionIcon = () => {
        return vehicle.transmission === 'Automatic' ? '⚙️' : '🔧';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl hover:border-zinc-700 transition-all duration-300 group"
        >
            {/* Vehicle Image */}
            <div className="relative h-48 overflow-hidden bg-zinc-900 font-bold">
                <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${vehicle.status === 'Available' ? 'bg-white text-black border-white' :
                        vehicle.status === 'Rented' ? 'bg-brand-blue text-white border-brand-blue' :
                            'bg-brand-red text-white border-brand-red'
                        }`}>
                        {vehicle.status}
                    </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-white px-4 py-1.5 rounded-lg shadow-xl cursor-default">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter leading-none">Daily Rate</p>
                        <p className="text-xl font-black text-black leading-none mt-0.5">{formatCurrency(vehicle.pricePerDay)}</p>
                    </div>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-5">
                <div className="mb-5">
                    <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight">
                        {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">{vehicle.plate} • {vehicle.year}</p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold uppercase tracking-wide">{vehicle.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Fuel className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold uppercase tracking-wide">{vehicle.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Gauge className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold uppercase tracking-wide">{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <span className="text-lg opacity-80">{getTransmissionIcon()}</span>
                        <span className="text-xs font-bold uppercase tracking-wide">{vehicle.transmission}</span>
                    </div>
                </div>

                {/* Health Bar */}
                <div className="mb-6 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Maintenance Score</span>
                        <span className={`text-[10px] font-black tracking-tighter ${vehicle.health >= 90 ? 'text-white' :
                            vehicle.health >= 70 ? 'text-white' :
                                'text-brand-red'
                            }`}>{vehicle.health}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${vehicle.health}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${vehicle.health >= 90 ? 'bg-white' :
                                vehicle.health >= 70 ? 'bg-brand-blue' :
                                    'bg-brand-red'
                                }`}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {vehicle.status === 'Available' && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 text-[10px] uppercase tracking-widest py-2 bg-brand-red hover:bg-red-700 border-brand-red"
                            onClick={() => onMaintenance(vehicle.id)}
                        >
                            Out of Service
                        </Button>
                    )}
                    {vehicle.status === 'Maintenance' && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 text-[10px] uppercase tracking-widest py-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                            onClick={() => onAvailable(vehicle.id)}
                        >
                            Make Available
                        </Button>
                    )}
                    {vehicle.status === 'Rented' && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-[10px] uppercase tracking-widest py-2 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Rented
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        className="text-[10px] uppercase tracking-widest py-2"
                        onClick={() => onEdit(vehicle)}
                    >
                        Edit
                    </Button>
                    <button
                        onClick={() => onDelete(vehicle.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors border border-zinc-800 hover:border-red-500"
                        title="Delete vehicle"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div >
    );
};

export default VehicleCard;
