import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const { user: authUser } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [clients, setClients] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [visitorCount, setVisitorCount] = useState(0);

    // Unified Light/Dark Theme management
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        // Fallback to system preference, but default to dark if not set
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'dark'; // defaulting to dark theme as base
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vParams, bParams, cParams, eParams, aParams] = await Promise.all([
                    supabase.from('vehicles').select('*').order('created_at'),
                    supabase.from('bookings').select('*').order('created_at'),
                    supabase.from('clients').select('*').order('created_at'),
                    supabase.from('expenses').select('*').order('created_at'),
                    supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
                ]);

                if (vParams.data) setVehicles(vParams.data.map(mapVehicleFromDB));
                if (bParams.data) setBookings(bParams.data.map(mapBookingFromDB));
                if (cParams.data) setClients(cParams.data.map(mapClientFromDB));
                if (eParams.data) setExpenses(eParams.data.map(mapExpenseFromDB));
                if (aParams.data) setAuditLogs(aParams.data);

                // Fetch today's visitors
                const today = new Date().toISOString().split('T')[0];
                const { data: vData } = await supabase
                    .from('visitor_stats')
                    .select('count')
                    .eq('visit_date', today)
                    .single();
                if (vData) setVisitorCount(vData.count);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const incrementVisitors = async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('visitor_stats')
            .select('id, count')
            .eq('visit_date', today)
            .single();

        if (existing) {
            const { data } = await supabase
                .from('visitor_stats')
                .update({ count: existing.count + 1 })
                .eq('id', existing.id)
                .select()
                .single();
            if (data) setVisitorCount(data.count);
        } else {
            const { data } = await supabase
                .from('visitor_stats')
                .insert([{ visit_date: today, count: 1 }])
                .select()
                .single();
            if (data) setVisitorCount(data.count);
        }
    };

    const logAction = async (actionType, entityType, entityId, details) => {
        const username = authUser ? (authUser.name || authUser.username) : 'Admin';
        const { data, error } = await supabase
            .from('audit_logs')
            .insert([{
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId?.toString(),
                details: details,
                performed_by: username
            }])
            .select()
            .single();
        
        if (data) setAuditLogs(prev => [data, ...prev]);
        if (error) console.error("Audit log error:", error);
    };

    // --- MAPPERS ---
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
        last_maintenance: v.lastMaintenance,
    });

    const mapBookingFromDB = (b) => {
        let status = b.status;
        if (status !== 'Cancelled' && status !== 'Completed') {
            const todayStr = new Date().toISOString().split('T')[0];
            const startDateStr = b.start_date?.substring(0, 10);
            const endDateStr = b.end_date?.substring(0, 10);

            if (todayStr < startDateStr) status = 'Upcoming';
            else if (todayStr >= startDateStr && todayStr <= endDateStr) status = 'Active';
            else if (todayStr > endDateStr) status = 'Active';
        }
        return {
            ...b,
            vehicleId: b.vehicle_id,
            clientId: b.client_id,
            startDate: b.start_date,
            endDate: b.end_date,
            createdAt: b.created_at,
            status: status,
            totalCost: Number(b.total_price),
            startingKm: b.start_km,
            endingKm: b.end_km,
            securityDeposit: Number(b.security_deposit || 0),
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
        };
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null || payload[key] === '') delete payload[key];
        });
        return payload;
    };

    const mapClientFromDB = (c) => ({ ...c, licenseNumber: c.license_number });
    const mapClientToDB = (c) => ({
        name: c.name, email: c.email, phone: c.phone, address: c.address, license_number: c.licenseNumber, notes: c.notes
    });

    const mapExpenseFromDB = e => ({ ...e, vehicleId: e.vehicle_id });
    const mapExpenseToDB = e => ({
        date: e.date, category: e.category, amount: e.amount, description: e.description, vehicle_id: e.vehicleId
    });

    // --- OPERATIONS ---
    const addVehicle = async (vehicle) => {
        const { data, error } = await supabase.from('vehicles').insert([mapVehicleToDB(vehicle)]).select().single();
        if (data) {
            const v = mapVehicleFromDB(data);
            setVehicles(prev => [...prev, v]);
            logAction('CREATE', 'VEHICLE', v.id, `Added vehicle ${v.brand} ${v.model} (${v.plate})`);
        }
    };

    const updateVehicle = async (id, updates) => {
        const dbUpdates = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.mileage !== undefined) dbUpdates.mileage = updates.mileage;
        if (updates.lastMaintenance !== undefined) dbUpdates.last_maintenance = updates.lastMaintenance;
        if (updates.pricePerDay !== undefined) dbUpdates.price_per_day = updates.pricePerDay;
        if (updates.brand) dbUpdates.brand = updates.brand;
        if (updates.model) dbUpdates.model = updates.model;
        if (updates.plate) dbUpdates.plate = updates.plate;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.seats !== undefined) dbUpdates.seats = updates.seats;
        if (updates.transmission) dbUpdates.transmission = updates.transmission;
        if (updates.fuel) dbUpdates.fuel = updates.fuel;
        if (updates.year !== undefined) dbUpdates.year = updates.year;

        const { data } = await supabase.from('vehicles').update(dbUpdates).eq('id', id).select().single();
        if (data) {
            const v = mapVehicleFromDB(data);
            setVehicles(prev => prev.map(item => item.id === id ? v : item));
            logAction('UPDATE', 'VEHICLE', id, `Updated vehicle ${v.brand} ${v.model}`);
        }
    };

    const deleteVehicle = async (id) => {
        const hasActive = bookings.some(b => b.vehicleId === id && (b.status === 'Active' || b.status === 'Upcoming'));
        if (hasActive) throw new Error("Vehicle has an active booking. Cancel or complete it first.");

        const v = vehicles.find(item => item.id === id);
        
        // Soft Delete: change status to 'Deleted' to preserve historical data
        const { error } = await supabase.from('vehicles').update({ status: 'Deleted' }).eq('id', id);
        
        if (error) {
            console.error("Error soft-deleting vehicle:", error);
            throw new Error("Failed to delete vehicle from the database.");
        }

        setVehicles(prev => prev.map(item => item.id === id ? { ...item, status: 'Deleted' } : item));
        
        logAction('DELETE', 'VEHICLE', id, `Soft deleted vehicle ${v?.brand} ${v?.model} (${v?.plate})`);
    };

    const setVehicleMaintenance = async (id) => {
        const hasActive = bookings.some(b => b.vehicleId === id && (b.status === 'Active' || b.status === 'Upcoming'));
        if (hasActive) throw new Error("Vehicle has an active booking. Cancel it first.");
        await updateVehicle(id, { status: 'Maintenance', lastMaintenance: new Date().toISOString().split('T')[0] });
    };

    const setVehicleAvailable = (id) => updateVehicle(id, { status: 'Available' });

    const addBooking = async (booking) => {
        const { data, error } = await supabase.from('bookings').insert([mapBookingToDB(booking)]).select().single();
        if (data) {
            const b = mapBookingFromDB(data);
            setBookings(prev => [...prev, b]);
            updateVehicle(booking.vehicleId, { status: 'Rented' });
            const c = clients.find(client => client.id === b.clientId);
            const clientName = c ? c.name : 'Unknown Client';
            logAction('CREATE', 'BOOKING', b.id, `Created booking for ${clientName} - ${b.totalCost} MAD`);
        }
        if (error) console.error("Error adding booking:", error);
    };

    const updateBooking = async (id, updates) => {
        const { data } = await supabase.from('bookings').update(mapBookingToDB(updates)).eq('id', id).select().single();
        if (data) {
            const b = mapBookingFromDB(data);
            setBookings(prev => prev.map(item => item.id === id ? b : item));
            logAction('UPDATE', 'BOOKING', id, `Updated booking for ${b.customer}`);
        }
    };

    const cancelBooking = async (id) => {
        const b = bookings.find(item => item.id === id);
        const { data } = await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', id).select().single();
        if (data) {
            const updated = mapBookingFromDB(data);
            setBookings(prev => prev.map(item => item.id === id ? updated : item));
            updateVehicle(updated.vehicleId, { status: 'Available' });
            logAction('CANCEL', 'BOOKING', id, `Cancelled booking for ${updated.customer}`);
        }
    };

    const deleteBooking = async (id) => {
        const b = bookings.find(item => item.id === id);
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) {
            console.error("Error deleting booking:", error);
            throw new Error("Failed to delete booking.");
        }
        
        setBookings(prev => prev.filter(item => item.id !== id));
        const c = clients.find(client => client.id === b?.clientId);
        const clientName = c ? c.name : 'Unknown Client';
        logAction('DELETE', 'BOOKING', id, `Deleted booking for ${clientName}`);
    };

    const addClient = async (client) => {
        const { data } = await supabase.from('clients').insert([mapClientToDB(client)]).select().single();
        if (data) {
            const c = mapClientFromDB(data);
            setClients(prev => [...prev, c]);
            logAction('CREATE', 'CLIENT', c.id, `Added client ${c.name}`);
        }
    };

    const updateClient = async (id, updates) => {
        const { data } = await supabase.from('clients').update(mapClientToDB(updates)).eq('id', id).select().single();
        if (data) {
            const c = mapClientFromDB(data);
            setClients(prev => prev.map(item => item.id === id ? c : item));
            logAction('UPDATE', 'CLIENT', id, `Updated client ${c.name}`);
        }
    };

    const deleteClient = async (id) => {
        const hasBookings = bookings.some(b => b.clientId === id);
        if (hasBookings) throw new Error("Client has existing bookings. Delete them first.");

        const c = clients.find(item => item.id === id);
        const { error } = await supabase.from('clients').delete().eq('id', id);
        
        if (error) {
            console.error("Error deleting client:", error);
            if (error.code === '23503') {
                throw new Error("Cannot delete client because they have associated records in the database.");
            }
            throw new Error("Failed to delete client.");
        }
        
        setClients(prev => prev.filter(item => item.id !== id));
        logAction('DELETE', 'CLIENT', id, `Deleted client ${c?.name}`);
    };

    const addExpense = async (expense) => {
        const { data } = await supabase.from('expenses').insert([mapExpenseToDB(expense)]).select().single();
        if (data) {
            const e = mapExpenseFromDB(data);
            setExpenses(prev => [...prev, e]);
            logAction('CREATE', 'EXPENSE', e.id, `Added expense: ${e.category} - ${e.amount} MAD`);
        }
    };

    const updateExpense = async (id, updates) => {
        const { data, error } = await supabase.from('expenses').update(mapExpenseToDB(updates)).eq('id', id).select().single();
        if (error) console.error("Error updating expense:", error);
        if (data) {
            const e = mapExpenseFromDB(data);
            setExpenses(prev => prev.map(item => item.id === id ? e : item));
            logAction('UPDATE', 'EXPENSE', id, `Updated expense: ${e.category}`);
        }
    };

    const deleteExpense = async (id) => {
        const e = expenses.find(item => item.id === id);
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        
        if (error) {
            console.error("Error deleting expense:", error);
            throw new Error("Failed to delete expense.");
        }
        
        setExpenses(prev => prev.filter(item => item.id !== id));
        logAction('DELETE', 'EXPENSE', id, `Deleted expense: ${e?.category}`);
    };

    const migrateVehicles = async () => {
        try {
            const local = localStorage.getItem('car-rental-vehicles');
            if (!local) return { success: false, message: 'No local data found' };
            const vehicles = JSON.parse(local);
            for (const v of vehicles) {
                const { data } = await supabase.from('vehicles').select('id').eq('plate', v.plate).single();
                if (!data) await addVehicle(v);
            }
            return { success: true, message: 'Migration complete' };
        } catch (error) { return { success: false, message: error.message }; }
    };

    const stats = {
        totalFleet: vehicles.filter(v => v.status !== 'Deleted').length,
        availableVehicles: vehicles.filter(v => v.status === 'Available').length,
        activeRentals: bookings.filter(b => b.status === 'Active').length,
        totalRevenue: bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.totalCost || 0), 0),
        monthlyRevenue: bookings
            .filter(b => {
                if (!b || b.status === 'Cancelled' || (!b.startDate && !b.createdAt)) return false;
                const date = new Date(b.startDate || b.createdAt);
                if (isNaN(date.getTime())) return false;
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, b) => sum + (b.totalCost || 0), 0),
    };

    const value = {
        vehicles, bookings, expenses, clients, auditLogs, loading,
        searchTerm, setSearchTerm, visitorCount, incrementVisitors,
        isAddVehicleModalOpen, setIsAddVehicleModalOpen,
        isNewBookingModalOpen, setIsNewBookingModalOpen,
        isClientModalOpen, setIsClientModalOpen,
        addVehicle, updateVehicle, deleteVehicle, setVehicleMaintenance, setVehicleAvailable,
        addBooking, updateBooking, deleteBooking, cancelBooking,
        addClient, updateClient, deleteClient,
        addExpense, updateExpense, deleteExpense,
        migrateVehicles, stats, theme, toggleTheme
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
