import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// LocalStorage keys
const STORAGE_KEYS = {
    VEHICLES: 'car-rental-vehicles',
    BOOKINGS: 'car-rental-bookings',
    EXPENSES: 'car-rental-expenses',
    CLIENTS: 'car-rental-clients',
};

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue = []) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;

        const parsed = JSON.parse(item);
        // If we expect an array (defaultValue is array) and got null/something else, return default
        if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
            return defaultValue;
        }
        return parsed || defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

export const AppProvider = ({ children }) => {
    const [vehicles, setVehicles] = useState(() => loadFromStorage(STORAGE_KEYS.VEHICLES, []));
    const [bookings, setBookings] = useState(() => loadFromStorage(STORAGE_KEYS.BOOKINGS, []));
    const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.EXPENSES, []));
    const [clients, setClients] = useState(() => loadFromStorage(STORAGE_KEYS.CLIENTS, []));
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Persist vehicles to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
    }, [vehicles]);

    // Persist bookings to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    }, [bookings]);

    // Persist expenses to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    }, [expenses]);

    // Persist clients to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    }, [clients]);

    // Vehicle operations
    const addVehicle = (vehicle) => {
        setVehicles([...vehicles, vehicle]);
    };

    const updateVehicle = (id, updates) => {
        setVehicles(vehicles.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const deleteVehicle = (id) => {
        setVehicles(vehicles.filter(v => v.id !== id));
    };

    const setVehicleMaintenance = (id) => {
        setVehicles(vehicles.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    status: 'Maintenance',
                    lastMaintenance: new Date().toISOString().split('T')[0]
                };
            }
            return v;
        }));
    };

    const setVehicleAvailable = (id) => {
        setVehicles(vehicles.map(v => {
            if (v.id === id) {
                return { ...v, status: 'Available' };
            }
            return v;
        }));
    };

    const toggleVehicleStatus = (id) => {
        setVehicles(vehicles.map(v => {
            if (v.id === id) {
                const newStatus = v.status === 'Available' ? 'Rented' :
                    v.status === 'Rented' ? 'Maintenance' : 'Available';
                return { ...v, status: newStatus };
            }
            return v;
        }));
    };

    // Booking operations
    const addBooking = (booking) => {
        setBookings([...bookings, booking]);
        // Update vehicle status to Rented
        updateVehicle(booking.vehicleId, { status: 'Rented' });
    };

    const updateBooking = (id, updates) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const cancelBooking = (id) => {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
            updateBooking(id, { status: 'Cancelled' });
            // Make vehicle available again
            updateVehicle(booking.vehicleId, { status: 'Available' });
        }
    };

    // Expense operations
    const addExpense = (expense) => {
        setExpenses([...expenses, expense]);
    };

    const updateExpense = (id, updates) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    // Client operations
    const addClient = (client) => {
        setClients([...clients, client]);
    };

    const updateClient = (id, updates) => {
        setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteClient = (id) => {
        setClients(clients.filter(c => c.id !== id));
    };

    // Stats calculations
    const stats = {
        totalFleet: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'Available').length,
        activeRentals: bookings.filter(b => b.status === 'Active').length,
        maintenanceVehicles: vehicles.filter(v => v.status === 'Maintenance').length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalCost, 0),
        monthlyRevenue: bookings
            .filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth())
            .reduce((sum, b) => sum + b.totalCost, 0),
    };

    const value = {
        vehicles,
        bookings,
        expenses,
        clients,
        searchTerm,
        setSearchTerm,
        isAddVehicleModalOpen,
        setIsAddVehicleModalOpen,
        isNewBookingModalOpen,
        setIsNewBookingModalOpen,
        isClientModalOpen,
        setIsClientModalOpen,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        deleteVehicle,
        toggleVehicleStatus,
        setVehicleMaintenance,
        setVehicleAvailable,
        addBooking,
        updateBooking,
        cancelBooking,
        addExpense,
        updateExpense,
        deleteExpense,
        addClient,
        updateClient,
        deleteClient,
        stats,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
