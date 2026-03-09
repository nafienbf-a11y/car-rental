import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vParams, bParams, cParams, eParams] = await Promise.all([
                supabase.from('vehicles').select('*').order('created_at'),
                supabase.from('bookings').select('*').order('created_at'),
                supabase.from('clients').select('*').order('created_at'),
                supabase.from('expenses').select('*').order('created_at')
            ]);

            if (vParams.data) setVehicles(vParams.data.map(mapVehicleFromDB));
            if (bParams.data) setBookings(bParams.data.map(mapBookingFromDB));
            if (cParams.data) setClients(cParams.data.map(mapClientFromDB));
            if (eParams.data) setExpenses(eParams.data.map(mapExpenseFromDB));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- MAPPERS (Snake_case <-> CamelCase) ---

    // Vehicle Mappers
    const mapVehicleFromDB = (v) => ({
        ...v,
        pricePerDay: Number(v.price_per_day),
        lastMaintenance: v.last_maintenance,
    });

    const mapVehicleToDB = (v) => ({
        brand: v.brand,
        model: v.model,
        year: parseInt(v.year),
        plate: v.plate,
        price_per_day: v.pricePerDay,
        category: v.category,
        seats: v.seats,
        transmission: v.transmission,
        fuel: v.fuel,
        image: v.image,
        status: v.status,
        mileage: v.mileage,
        health: v.health,
        last_maintenance: v.lastMaintenance,
    });

    // Booking Mappers
    const mapBookingFromDB = (b) => {
        let status = b.status;

        // Calculate dynamic status if not Cancelled or Completed explicitly
        if (status !== 'Cancelled' && status !== 'Completed') {
            const today = new Date(); // Local date reference
            // Format today as YYYY-MM-DD in LOCAL time
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            const startDateStr = b.start_date ? b.start_date.substring(0, 10) : '';
            const endDateStr = b.end_date ? b.end_date.substring(0, 10) : '';

            if (todayStr < startDateStr) {
                status = 'Upcoming';
            } else if (todayStr >= startDateStr && todayStr <= endDateStr) {
                status = 'Active';
            } else if (todayStr > endDateStr) {
                status = 'Active';
            }
        }

        return {
            ...b,
            vehicleId: b.vehicle_id,
            clientId: b.client_id,
            startDate: b.start_date,
            endDate: b.end_date,
            createdAt: b.created_at, // Map DB column to frontend prop
            status: status, // Use calculated status
            totalCost: Number(b.total_price), // Note: Frontend uses totalCost, DB total_price
            startingKm: b.start_km,
            endingKm: b.end_km,
            securityDeposit: Number(b.security_deposit || 0),
            documents: b.documents || [],
        };
    };

    const mapBookingToDB = (b) => {
        const payload = {
            vehicle_id: b.vehicleId,
            client_id: b.clientId,
            start_date: b.startDate,
            end_date: b.endDate,
            status: b.status,
            total_price: b.totalCost,
            start_km: b.startingKm,
            end_km: b.endingKm,
            security_deposit: b.securityDeposit,
            documents: b.documents || [],
        };
        // Remove undefined/null/empty keys to avoid DB column errors
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
                delete payload[key];
            }
        });
        return payload;
    };

    // Client Mappers
    const mapClientFromDB = (c) => ({
        ...c,
        licenseNumber: c.license_number,
        documents: c.documents || [],
    });

    const mapClientToDB = (c) => {
        const payload = {
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            license_number: c.licenseNumber,
            documents: c.documents || [],
            notes: c.notes,
        };
        // Remove undefined/null keys
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
                delete payload[key];
            }
        });
        return payload;
    };

    // Expense Mappers
    const mapExpenseFromDB = e => ({ ...e, vehicleId: e.vehicle_id });
    const mapExpenseToDB = e => ({
        date: e.date, category: e.category, amount: e.amount, description: e.description, vehicle_id: e.vehicleId
    });


    // --- OPERATIONS ---

    // Vehicle Operations
    const addVehicle = async (vehicle) => {
        const payload = mapVehicleToDB(vehicle);
        const { data, error } = await supabase.from('vehicles').insert([payload]).select().single();
        if (data) setVehicles(prev => [...prev, mapVehicleFromDB(data)]);
        if (error) console.error("Error adding vehicle:", error);
    };

    const updateVehicle = async (id, updates) => {
        // We need to map updates carefully. 
        // Simple hack: Map a dummy full object to get keys, or just manually map common fields if needed.
        // Better: create specific partial mapper or strict check.
        // For now, let's just handle specific known update fields manualy if simple, or use mapVehicleToDB logic loosely.

        const dbUpdates = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.mileage !== undefined) dbUpdates.mileage = updates.mileage;
        if (updates.lastMaintenance) dbUpdates.last_maintenance = updates.lastMaintenance;
        if (updates.pricePerDay) dbUpdates.price_per_day = updates.pricePerDay;
        if (updates.brand) dbUpdates.brand = updates.brand; // etc for edits
        // Add other fields as needed for edit form
        if (updates.model) dbUpdates.model = updates.model;
        if (updates.plate) dbUpdates.plate = updates.plate;

        const { data, error } = await supabase.from('vehicles').update(dbUpdates).eq('id', id).select().single();

        if (data) {
            setVehicles(prev => prev.map(v => v.id === id ? mapVehicleFromDB(data) : v));
        }
        if (error) console.error("Error updating vehicle:", error);
    };

    const deleteVehicle = async (id) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (!error) setVehicles(prev => prev.filter(v => v.id !== id));
    };

    // Helper shortcuts
    const setVehicleMaintenance = (id) => updateVehicle(id, { status: 'Maintenance', lastMaintenance: new Date().toISOString().split('T')[0] });
    const setVehicleAvailable = (id) => updateVehicle(id, { status: 'Available' });
    const toggleVehicleStatus = (id) => {
        const v = vehicles.find(v => v.id === id);
        if (v) {
            const newStatus = v.status === 'Available' ? 'Rented' :
                v.status === 'Rented' ? 'Maintenance' : 'Available';
            updateVehicle(id, { status: newStatus });
        }
    };


    // Booking Operations
    const addBooking = async (booking) => {
        const payload = mapBookingToDB(booking);
        let { data, error } = await supabase.from('bookings').insert([payload]).select().single();

        // If a column doesn't exist, strip it and retry
        if (error && error.code === 'PGRST204') {
            const match = error.message.match(/Could not find the '(\w+)' column/);
            if (match) {
                console.warn(`Column '${match[1]}' not found, retrying without it...`);
                delete payload[match[1]];
                ({ data, error } = await supabase.from('bookings').insert([payload]).select().single());
            }
        }

        if (data) {
            // Merge documents back into the returned data for frontend state
            const bookingData = mapBookingFromDB(data);
            if (booking.documents && booking.documents.length > 0 && !bookingData.documents?.length) {
                bookingData.documents = booking.documents;
            }
            setBookings(prev => [...prev, bookingData]);
            // Auto-update vehicle to Rented
            updateVehicle(booking.vehicleId, { status: 'Rented' });
        }
        if (error) console.error("Error adding booking:", error);
    };

    const updateBooking = async (id, updates) => {
        const dbUpdates = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.endingKm) dbUpdates.end_km = updates.endingKm;
        if (updates.securityDeposit !== undefined) dbUpdates.security_deposit = updates.securityDeposit;
        if (updates.documents) dbUpdates.documents = updates.documents;
        if (updates.startingKm) dbUpdates.start_km = updates.startingKm;
        if (updates.startDate) dbUpdates.start_date = updates.startDate;
        if (updates.endDate) dbUpdates.end_date = updates.endDate;
        if (updates.vehicleId) dbUpdates.vehicle_id = updates.vehicleId;
        if (updates.clientId) dbUpdates.client_id = updates.clientId;
        if (updates.totalCost !== undefined) dbUpdates.total_price = updates.totalCost;

        const { data, error } = await supabase.from('bookings').update(dbUpdates).eq('id', id).select().single();
        if (error) console.error("Error updating booking:", error);
        if (data) setBookings(prev => prev.map(b => b.id === id ? mapBookingFromDB(data) : b));
    };

    const cancelBooking = async (id) => {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
            await updateBooking(id, { status: 'Cancelled' });
            await updateVehicle(booking.vehicleId, { status: 'Available' });
        }
    };

    // Client Operations
    const addClient = async (client) => {
        const payload = mapClientToDB(client);
        // Remove undefined/null keys to avoid DB column errors
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
                delete payload[key];
            }
        });
        const { data, error } = await supabase.from('clients').insert([payload]).select().single();
        if (error) console.error("Error adding client:", error);
        if (data) setClients(prev => [...prev, mapClientFromDB(data)]);
    };

    const updateClient = async (id, updates) => {
        const dbUpdates = mapClientToDB(updates);
        const { data, error } = await supabase.from('clients').update(dbUpdates).eq('id', id).select().single();
        if (error) console.error("Error updating client:", error);
        if (data) setClients(prev => prev.map(c => c.id === id ? mapClientFromDB(data) : c));
    };

    const deleteClient = async (id) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) setClients(prev => prev.filter(c => c.id !== id));
    };


    // Expense Operations
    const addExpense = async (expense) => {
        const payload = mapExpenseToDB(expense);
        const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
        if (data) setExpenses(prev => [...prev, mapExpenseFromDB(data)]);
    };

    const updateExpense = async (id, updates) => {
        // Simplified
        const { data } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
        if (data) setExpenses(prev => prev.map(e => e.id === id ? mapExpenseFromDB(data) : e));
    };

    const deleteExpense = async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) setExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Migration Helper
    const migrateVehicles = async () => {
        // Force rebuild comment
        try {
            const local = localStorage.getItem('car-rental-vehicles');
            if (!local) return { success: false, message: 'No local data found' };

            const vehicles = JSON.parse(local);
            let count = 0;

            for (const v of vehicles) {
                // Check if already exists (by plate) to prevent duplicates
                const { data } = await supabase.from('vehicles').select('id').eq('plate', v.plate).single();
                if (!data) {
                    await addVehicle(v); // This handles mapping
                    count++;
                }
            }
            return { success: true, message: `Migrated ${count} vehicles successfully!` };
        } catch (error) {
            console.error('Migration failed:', error);
            return { success: false, message: error.message };
        }
    };

    // Stats
    const stats = {
        totalFleet: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'Available').length,
        activeRentals: bookings.filter(b => b.status === 'Active').length,
        maintenanceVehicles: vehicles.filter(v => v.status === 'Maintenance').length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
        monthlyRevenue: bookings
            .filter(b => b.createdAt && new Date(b.createdAt).getMonth() === new Date().getMonth())
            .reduce((sum, b) => sum + (b.totalCost || 0), 0),
    };

    const value = {
        vehicles, bookings, expenses, clients, loading,
        searchTerm, setSearchTerm,
        isAddVehicleModalOpen, setIsAddVehicleModalOpen,
        isNewBookingModalOpen, setIsNewBookingModalOpen,
        isClientModalOpen, setIsClientModalOpen,
        addVehicle, updateVehicle, deleteVehicle,
        toggleVehicleStatus, setVehicleMaintenance, setVehicleAvailable,
        addBooking, updateBooking, cancelBooking,
        addExpense, updateExpense, deleteExpense,
        addClient, updateClient, deleteClient,
        migrateVehicles, // Exposed for UI
        stats,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
