import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers';

const History = () => {
    const { bookings, vehicles } = useApp();
    const [localSearch, setLocalSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown';
    };

    const getVehiclePlate = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle?.plate || 'N/A';
    };

    // Filter bookings by search
    const filteredBookings = useMemo(() => {
        if (!localSearch) return bookings;

        const search = localSearch.toLowerCase();
        return bookings.filter(b =>
            b.customer.toLowerCase().includes(search) ||
            b.email.toLowerCase().includes(search) ||
            getVehiclePlate(b.vehicleId).toLowerCase().includes(search) ||
            b.id.toLowerCase().includes(search)
        );
    }, [bookings, localSearch]);

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Booking History</h1>
                <p className="text-zinc-500 font-medium tracking-tight">Search and review all past bookings</p>
            </div>

            {/* Search and Export */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <SearchBar
                    value={localSearch}
                    onChange={setLocalSearch}
                    placeholder="Search by customer, plate, or booking ID..."
                    className="w-full sm:w-96"
                />
                <Button variant="secondary" icon={Download} className="text-[10px] uppercase tracking-widest">
                    Export CSV
                </Button>
            </div>

            {/* Results Summary */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-lg">
                <p className="text-zinc-400 text-sm font-medium">
                    Showing <span className="font-extrabold text-white">{paginatedBookings.length}</span> of{' '}
                    <span className="font-extrabold text-white">{filteredBookings.length}</span> bookings
                </p>
            </div>

            {/* History Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Booking ID</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Customer</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vehicle</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Plate</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Duration</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {paginatedBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-zinc-900/50 transition-colors"
                                >
                                    <td className="p-5">
                                        <span className="text-brand-blue font-mono text-xs font-bold">{booking.id}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-400 text-xs font-bold">{formatDate(booking.createdAt)}</span>
                                    </td>
                                    <td className="p-5">
                                        <div>
                                            <p className="text-white font-extrabold text-sm">{booking.customer}</p>
                                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide">{booking.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-300 font-bold text-sm">{getVehicleName(booking.vehicleId)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-500 font-mono text-xs font-bold uppercase tracking-wider">{getVehiclePlate(booking.vehicleId)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-400 text-xs font-bold">
                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'Active' ? 'bg-white text-black border-white' :
                                                booking.status === 'Completed' ? 'bg-zinc-900 text-zinc-400 border-zinc-800' :
                                                    'bg-brand-red text-white border-brand-red font-semibold'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-white font-black text-sm">{formatCurrency(booking.totalCost)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="text-[10px] uppercase tracking-widest"
                        >
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${currentPage === page
                                        ? 'bg-white text-black border-white'
                                        : 'text-zinc-500 border-zinc-800 hover:bg-zinc-900 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="text-[10px] uppercase tracking-widest"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
