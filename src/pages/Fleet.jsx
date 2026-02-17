import React, { useState, useMemo } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VehicleCard from '../components/fleet/VehicleCard';
import AddVehicleModal from '../components/fleet/AddVehicleModal';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

import { useNotification } from '../context/NotificationContext';

import { useLanguage } from '../context/LanguageContext';

const Fleet = () => {
    const { vehicles, bookings, addVehicle, updateVehicle, deleteVehicle, setVehicleMaintenance, setVehicleAvailable, searchTerm, setIsAddVehicleModalOpen, isAddVehicleModalOpen, migrateVehicles } = useApp();
    const { showNotification } = useNotification();
    const { t } = useLanguage();
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [migrating, setMigrating] = useState(false);

    // Calculate dynamic status for all vehicles
    const vehiclesWithStatus = useMemo(() => {
        return vehicles.map(vehicle => {
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
        let result = vehiclesWithStatus;

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

    const handleUpdateVehicle = (updatedVehicle) => {
        updateVehicle(updatedVehicle.id, updatedVehicle);
        setIsEditModalOpen(false);
        setEditingVehicle(null);
        showNotification(t('fleet.updatedSuccess'), 'success');
    };

    const handleDeleteVehicle = (id) => {
        if (window.confirm(t('fleet.deleteConfirm'))) {
            deleteVehicle(id);
            showNotification(t('fleet.deletedSuccess'), 'success');
        }
    };

    const handleSetMaintenance = (id) => {
        setVehicleMaintenance(id);
        showNotification(t('fleet.maintenanceSuccess'), 'warning');
    };

    const handleSetAvailable = (id) => {
        setVehicleAvailable(id);
        showNotification(t('fleet.availableSuccess'), 'success');
    };

    const handleMigrate = async () => {
        if (!window.confirm(t('fleet.importConfirm'))) return;

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
                        variant="ghost"
                        icon={Upload}
                        onClick={handleMigrate}
                        disabled={migrating}
                        className="text-zinc-400 hover:text-white"
                    >
                        {migrating ? t('fleet.importing') : t('fleet.importLegacy')}
                    </Button>
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
                {statusFilters.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${statusFilter === status
                            ? 'bg-white text-black shadow-lg'
                            : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                            }`}
                    >
                        {t(`fleet.${status.toLowerCase()}`)}
                        {status !== 'All' && (
                            <span className="ml-2 opacity-50 font-medium">
                                {vehicles.filter(v => v.status === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Fleet Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{t('fleet.totalVehicles')}</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">{vehicles.length}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{t('fleet.available')}</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">
                        {vehicles.filter(v => v.status === 'Available').length}
                    </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{t('fleet.rented')}</p>
                    <p className="text-2xl font-extrabold text-brand-blue tracking-tight">
                        {vehicles.filter(v => v.status === 'Rented').length}
                    </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{t('fleet.maintenance')}</p>
                    <p className="text-2xl font-extrabold text-brand-red tracking-tight">
                        {vehicles.filter(v => v.status === 'Maintenance').length}
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
