
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const useRecentActivity = () => {
    const { bookings, vehicles, clients } = useApp();
    const { t } = useLanguage();
    const [activities, setActivities] = useState([]);

    const getVehicleName = (id) => {
        const v = vehicles.find(v => v.id === id);
        return v ? `${v.brand} ${v.model}` : 'Unknown Vehicle';
    };

    useEffect(() => {
        const generateActivities = () => {
            const newActivities = [];
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];



            // 1. New Bookings
            bookings.forEach(b => {
                const createdDate = b.createdAt ? new Date(b.createdAt) : (b.created_at ? new Date(b.created_at) : new Date());

                // Only show "New Booking" if created in last 7 days
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                if (createdDate > oneWeekAgo) {
                    newActivities.push({
                        id: `booking-new-${b.id}`,
                        type: 'booking_new',
                        date: createdDate,
                        title: t('activity.newBooking'),
                        message: `${b.customer || 'Client'} - ${getVehicleName(b.vehicleId)}`,
                        link: '/admin/bookings'
                    });
                }

                // 2. Booking Starting Today
                const startDate = b.startDate || (b.start_date ? b.start_date.substring(0, 10) : '');

                if (startDate === todayStr) {
                    newActivities.push({
                        id: `booking-start-${b.id}`,
                        type: 'booking_start',
                        date: new Date(),
                        title: t('activity.bookingStarting'),
                        message: `${b.customer || 'Client'} - ${getVehicleName(b.vehicleId)}`,
                        link: '/admin/bookings'
                    });
                }

                // 3. Booking Ending Today
                const endDate = b.endDate || (b.end_date ? b.end_date.substring(0, 10) : '');
                if (endDate === todayStr) {
                    newActivities.push({
                        id: `booking-end-${b.id}`,
                        type: 'booking_end',
                        date: new Date(), // It's happening today
                        title: t('activity.bookingEnding'),
                        message: `${b.customer || 'Client'} - ${getVehicleName(b.vehicleId)}`,
                        link: '/admin/bookings'
                    });
                }
            });

            // 4. New Clients
            clients.forEach(c => {
                const createdDate = c.createdAt ? new Date(c.createdAt) : (c.created_at ? new Date(c.created_at) : new Date());
                const oneMonthAgo = new Date();
                oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

                if (createdDate > oneMonthAgo) {
                    newActivities.push({
                        id: `client-new-${c.id}`,
                        type: 'client_new',
                        date: createdDate,
                        title: t('activity.newClient'),
                        message: `${c.first_name} ${c.last_name}`,
                        link: '/admin/clients'
                    });
                }
            });

            // 5. New Cars
            vehicles.forEach(v => {
                const createdDate = v.createdAt ? new Date(v.createdAt) : (v.created_at ? new Date(v.created_at) : new Date());
                // Show all vehicles for now as fleet size is small, or filter like above
                newActivities.push({
                    id: `vehicle-new-${v.id}`,
                    type: 'vehicle_new',
                    date: createdDate,
                    title: t('activity.newVehicle'),
                    message: `${v.brand} ${v.model}`,
                    link: '/admin/fleet'
                });
            });

            // Sort by date descending
            newActivities.sort((a, b) => b.date - a.date);

            setActivities(newActivities);
        };

        generateActivities();
    }, [bookings, vehicles, clients, t]);


    return activities;
};
