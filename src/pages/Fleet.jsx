import React, { useState, useMemo } from 'react';
import { Plus, Upload, Wrench, Car, CheckCircle, Key } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import VehicleCard from '../components/fleet/VehicleCard';
import AddVehicleModal from '../components/fleet/AddVehicleModal';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

import { useNotification } from '../context/NotificationContext';

import { useLanguage } from '../context/LanguageContext';

const Fleet = () => {
    const { vehicles, bookings, expenses, addVehicle, updateVehicle, deleteVehicle, setVehicleMaintenance, setVehicleAvailable, searchTerm, setIsAddVehicleModalOpen, isAddVehicleModalOpen, migrateVehicles } = useApp();
    const { showNotification, confirmAction } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [migrating, setMigrating] = useState(false);

    // Calculate dynamic status for all vehicles
    const vehiclesWithStatus = useMemo(() => {
        return vehicles.map(vehicle => {
            // Deleted overrides everything
            if (vehicle.status === 'Deleted') return vehicle;
            // Maintenance overrides everything
            if (vehicle.status === 'Maintenance') return vehicle;

            // Check for active booking
            const hasActiveBooking = bookings.some(b =>
                b.vehicleId === vehicle.id &&
                b.status === 'Active'
            );

            // If active booking, force Rented. Otherwise, force Available 
            // (unless it was Maintenance, which is handled above).
            // We override manual 'Rented' status if there is no active booking to ensure "Available as of today" is accurate.
            return {
                ...vehicle,
                status: hasActiveBooking ? 'Rented' : 'Available'
            };
        });
    }, [vehicles, bookings]);

    // Filter vehicles based on dynamic status
    const filteredVehicles = useMemo(() => {
        let result = vehiclesWithStatus.filter(v => v.status !== 'Deleted');

        // Filter by status
        if (statusFilter !== 'All') {
            result = result.filter(v => v.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.brand.toLowerCase().includes(term) ||
                v.model.toLowerCase().includes(term) ||
                v.plate.toLowerCase().includes(term)
            );
        }

        return result;
    }, [vehiclesWithStatus, statusFilter, searchTerm]);

    const handleAddVehicle = (vehicle) => {
        addVehicle(vehicle);
        showNotification(t('fleet.addedSuccess'), 'success');
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setIsEditModalOpen(true);
    };

    const handleUpdateVehicle = async (updatedVehicle) => {
        const confirmed = await confirmAction({
            title: t('common.confirm') || 'Confirm',
            message: "Are you sure you want to modify this vehicle?"
        });
        if (!confirmed) return;
        updateVehicle(updatedVehicle.id, updatedVehicle);
        setIsEditModalOpen(false);
        setEditingVehicle(null);
        showNotification(t('fleet.updatedSuccess'), 'success');
    };

    const handleDeleteVehicle = async (id) => {
        const confirmed = await confirmAction({
            title: t('common.confirm') || 'Confirm',
            message: t('fleet.deleteConfirm') || "Are you sure you want to delete this vehicle?"
        });
        if (confirmed) {
            try {
                await deleteVehicle(id);
                showNotification(t('fleet.deletedSuccess'), 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const handleSetMaintenance = async (id) => {
        try {
            await setVehicleMaintenance(id);
            showNotification(t('fleet.maintenanceSuccess'), 'warning');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleSetAvailable = (id) => {
        setVehicleAvailable(id);
        showNotification(t('fleet.availableSuccess'), 'success');
    };

    const handleMigrate = async () => {
        const confirmed = await confirmAction({
            title: t('common.confirm') || 'Confirm',
            message: t('fleet.importConfirm') || "Are you sure you want to import?"
        });
        if (!confirmed) return;

        setMigrating(true);
        const result = await migrateVehicles();
        setMigrating(false);

        if (result.success) {
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message, 'error');
        }
    };

    const statusFilters = ['All', 'Available', 'Rented', 'Maintenance'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">{t('fleet.title')}</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">{t('fleet.subtitle')}</p>
                </div>
                <div className="flex gap-2">

                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsAddVehicleModalOpen(true)}
                    >
                        {t('fleet.addVehicle')}
                    </Button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 inline-flex gap-1.5 overflow-x-auto max-w-full">
                {statusFilters.map((status) => {
                    const count = status === 'All'
                        ? vehiclesWithStatus.filter(v => v.status !== 'Deleted').length
                        : vehiclesWithStatus.filter(v => v.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${statusFilter === status
                                ? 'bg-white text-black shadow-lg'
                                : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                                }`}
                        >
                            {t(`fleet.${status.toLowerCase()}`)}
                            <span className="ml-2 opacity-50 font-medium">
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Fleet Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-zinc-400" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('fleet.totalVehicles')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {vehiclesWithStatus.filter(v => v.status !== 'Deleted').length}
                    </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-brand-blue" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('fleet.available')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {vehiclesWithStatus.filter(v => v.status === 'Available').length}
                    </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Key className="w-5 h-5 text-zinc-400" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('fleet.rented')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {vehiclesWithStatus.filter(v => v.status === 'Rented').length}
                    </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-brand-red" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('fleet.maintenance')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {vehiclesWithStatus.filter(v => v.status === 'Maintenance').length}
                    </p>
                </div>
            </div>

            {/* Vehicle Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <LoadingSkeleton variant="card" count={8} />
                </div>
            ) : filteredVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            onMaintenance={handleSetMaintenance}
                            onAvailable={handleSetAvailable}
                            onEdit={handleEditVehicle}
                            onDelete={handleDeleteVehicle}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-dark rounded-2xl p-12 text-center">
                    <p className="text-slate-400 text-lg">{t('fleet.noVehicles')}</p>
                    <p className="text-slate-500 text-sm mt-2">
                        {searchTerm
                            ? t('fleet.adjustFilters')
                            : t('fleet.startAdding')}
                    </p>
                </div>
            )}

            {/* Mileage & Maintenance Monitoring */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <Wrench className="w-6 h-6 text-brand-blue" />
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Mileage & Maintenance Monitoring</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.filter(v => v.status !== 'Deleted').map((vehicle) => {
                        const vehicleExpenses = expenses ? expenses.filter(e => e.vehicleId === vehicle.id) : [];
                        const totalExpense = vehicleExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                        return (
                            <div key={vehicle.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                                    <div>
                                        <p className="text-white font-bold text-sm">{vehicle.brand} {vehicle.model}</p>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{vehicle.plate}</p>
                                    </div>
                                    <span className="text-xs font-black text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-lg">
                                        {vehicle.mileage || 0} KM
                                    </span>
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Last Maintenance:</span>
                                        <span className="font-semibold text-white">{vehicle.lastMaintenance ? formatDate(vehicle.lastMaintenance) : 'Never'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Maintenance Expenses:</span>
                                        <span className="font-bold text-emerald-500">{formatCurrency(totalExpense)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={isAddVehicleModalOpen}
                onClose={() => setIsAddVehicleModalOpen(false)}
                onAdd={handleAddVehicle}
            />

            {/* Edit Vehicle Modal */}
            <AddVehicleModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingVehicle(null);
                }}
                onAdd={handleUpdateVehicle}
                vehicle={editingVehicle}
            />
        </div>
    );
};

export default Fleet;
