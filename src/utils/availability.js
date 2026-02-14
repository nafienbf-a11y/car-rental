import { calculateDays } from './helpers';

// Check if a date is within a range (inclusive)
export const isDateInRange = (date, startDate, endDate) => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset hours to compare only dates
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return d >= start && d <= end;
};

// Get all blocked dates for a specific vehicle
export const getBlockedDates = (vehicleId, bookings) => {
    if (!vehicleId || !bookings) return [];

    const vehicleBookings = bookings.filter(b =>
        b.vehicleId === vehicleId &&
        (b.status === 'Active' || b.status === 'Maintenance')
    );

    const blockedDates = [];

    vehicleBookings.forEach(booking => {
        // Ensure we work with local dates
        const start = new Date(booking.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(booking.endDate);
        end.setHours(0, 0, 0, 0);

        // Loop through each day of the booking
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            blockedDates.push({
                date: new Date(d), // This preserves the local 00:00:00 time
                status: booking.status, // 'Active' or 'Maintenance'
                bookingId: booking.id
            });
        }
    });

    return blockedDates;
};

// Check if a specific date is blocked
export const isDateBlocked = (dateStr, blockedDates) => {
    // dateStr should be YYYY-MM-DD
    // Ensure input is a string YYYY-MM-DD. If it's a date object, convert it.
    let targetStr = dateStr;
    if (dateStr instanceof Date) {
        const y = dateStr.getFullYear();
        const m = String(dateStr.getMonth() + 1).padStart(2, '0');
        const d = String(dateStr.getDate()).padStart(2, '0');
        targetStr = `${y}-${m}-${d}`;
    }

    return blockedDates.find(b => {
        // blockedDates are stored as objects, usually with 'date' as Date object.
        // We need to convert that to string for comparison or ensure getBlockedDates returns strings.
        // Let's handle 'b.date' being a Date object safer:
        const bDate = new Date(b.date);
        const y = bDate.getFullYear();
        const m = String(bDate.getMonth() + 1).padStart(2, '0');
        const d = String(bDate.getDate()).padStart(2, '0');
        const bStr = `${y}-${m}-${d}`;

        return bStr === targetStr;
    });
};

// Validate a booking range for overlaps
export const validateBookingRange = (startDate, endDate, blockedDates) => {
    if (!startDate || !endDate) return { valid: false, error: 'Select dates' };

    // Standardize to YYYY-MM-DD strings for comparison
    const startStr = startDate.split('T')[0];
    const endStr = endDate.split('T')[0];

    // Get today's date in local YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // 1. Check for past dates (String comparison works for YYYY-MM-DD)
    if (startStr < todayStr) {
        return { valid: false, error: 'Cannot book past dates' };
    }

    // 2. Check blocked dates within range
    // 2. Check blocked dates within range
    // We iterate using Date objects but compare using strings
    let currentDate = new Date(startStr);
    const lastDate = new Date(endStr);

    // Reset times for safe iteration
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    while (currentDate <= lastDate) {
        // Format current iteration date to string
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const currentStr = `${y}-${m}-${d}`;

        if (isDateBlocked(currentStr, blockedDates)) {
            return { valid: false, error: 'Overlap detected! Selected range includes blocked dates.' };
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Check logic (End after Start)
    if (endStr < startStr) {
        return { valid: false, error: 'End date must be after start date' };
    }

    return { valid: true };
};

// Get status color for calendar day
export const getDayStatusColor = (date, blockedDates, selectionStart, selectionEnd) => {
    // 1. Check if selected
    if (selectionStart && selectionEnd && isDateInRange(date, selectionStart, selectionEnd)) {
        return 'bg-brand-blue text-white hover:bg-brand-blue'; // Blue for selection
    }
    if (selectionStart && new Date(date).toDateString() === new Date(selectionStart).toDateString()) {
        return 'bg-brand-blue text-white hover:bg-brand-blue'; // Start date selection
    }

    // 2. Check if blocked
    // Format date to YYYY-MM-DD for checking
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const blocked = isDateBlocked(dateStr, blockedDates);
    if (blocked) {
        if (blocked.status === 'Maintenance') {
            return 'bg-orange-900/50 text-orange-400 cursor-not-allowed border border-orange-800/50'; // Orange for Maintenance
        }
        return 'bg-zinc-900 text-zinc-500 line-through cursor-not-allowed border border-zinc-800 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)] bg-[length:10px_10px]'; // Red strikethrough for Booked
    }

    // 3. Available
    return 'hover:bg-zinc-800 text-white cursor-pointer'; // Greenish hover implied by "Available" logic in UI
};
