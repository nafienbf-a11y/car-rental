// Date formatting utilities
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateRange = (startDate, endDate) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Currency formatting
export const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} MAD`;
};

// Calculate days between dates
// Calculate days between dates (inclusive)
export const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    // Create dates and reset time to midnight to ensure accurate day calculation
    // We treat the input strings as local YYYY-MM-DD
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Inclusive of start day
};

// Status color mapping
export const getStatusColor = (status) => {
    const colors = {
        Available: 'success',
        Rented: 'primary',
        Maintenance: 'warning',
        Active: 'primary',
        Completed: 'success',
        Cancelled: 'danger',
    };
    return colors[status] || 'primary';
};

// Get status badge classes
export const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    const colorClasses = {
        Available: 'bg-success-500/20 text-success-300 border border-success-500/30',
        Rented: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
        Maintenance: 'bg-warning-500/20 text-warning-300 border border-warning-500/30',
        Active: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
        Completed: 'bg-success-500/20 text-success-300 border border-success-500/30',
        Cancelled: 'bg-danger-500/20 text-danger-300 border border-danger-500/30',
    };
    return `${baseClasses} ${colorClasses[status] || colorClasses.Available}`;
};

// Search filter helper
export const filterBySearch = (items, searchTerm, fields) => {
    if (!searchTerm) return items;

    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item =>
        fields.some(field => {
            const value = field.split('.').reduce((obj, key) => obj?.[key], item);
            return value?.toString().toLowerCase().includes(lowerSearch);
        })
    );
};

// Get health color based on percentage
export const getHealthColor = (health) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'danger';
};

// Generate unique ID
export const generateId = (prefix) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};
