import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AddVehicleModal from '../fleet/AddVehicleModal';
import BookNowModal from '../bookings/BookNowModal';
import { useApp } from '../../context/AppContext';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {
        isAddVehicleModalOpen,
        setIsAddVehicleModalOpen,
        addVehicle,
        isNewBookingModalOpen,
        setIsNewBookingModalOpen,
        addBooking,
        vehicles
    } = useApp();

    return (
        <div className="min-h-screen">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="lg:pl-64 min-h-screen flex flex-col">
                <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>

            {/* Global Modals */}
            <AddVehicleModal
                isOpen={isAddVehicleModalOpen}
                onClose={() => setIsAddVehicleModalOpen(false)}
                onAdd={addVehicle}
            />

            <BookNowModal
                isOpen={isNewBookingModalOpen}
                onClose={() => setIsNewBookingModalOpen(false)}
                onAdd={addBooking}
                vehicles={vehicles}
            />
        </div>
    );
};

export default MainLayout;
