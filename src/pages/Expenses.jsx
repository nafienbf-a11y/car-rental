import React, { useState } from 'react';
import { DollarSign, Wrench, Plus, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import ExpenseModal from '../components/expenses/ExpenseModal';
import { formatDate, formatCurrency } from '../utils/helpers';

const Expenses = () => {
    const { expenses, vehicles, deleteExpense } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : 'Unknown';
    };

    const getVehicle = (vehicleId) => {
        return vehicles.find(v => v.id === vehicleId);
    };

    const getCategoryColor = (type) => {
        const colors = {
            Oil: 'primary',
            Tires: 'warning',
            Insurance: 'success',
            Repair: 'danger',
        };
        return colors[type] || 'primary';
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            deleteExpense(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Expenses & Maintenance</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Track vehicle maintenance and costs</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Expense
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-brand-red" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Total Expenses</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-zinc-400" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Maintenance Items</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{expenses.length}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-brand-blue" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Avg Cost</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {formatCurrency(totalExpenses / expenses.length || 0)}
                    </p>
                </div>
            </div>

            {/* Vehicle Health Overview */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-extrabold text-white mb-6 tracking-tight">Vehicle Health Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.slice(0, 6).map((vehicle) => (
                        <div key={vehicle.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-white font-bold text-sm">{vehicle.brand} {vehicle.model}</p>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{vehicle.plate}</p>
                                </div>
                                <span className={`text-lg font-black ${vehicle.health >= 90 ? 'text-white' :
                                    vehicle.health >= 70 ? 'text-white' :
                                        'text-brand-red'
                                    }`}>{vehicle.health}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${vehicle.health >= 90 ? 'bg-white' :
                                        vehicle.health >= 70 ? 'bg-brand-blue' :
                                            'bg-brand-red'
                                        }`}
                                    style={{ width: `${vehicle.health}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-3">
                                Last service: {formatDate(vehicle.lastMaintenance)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Recent Expenses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vehicle</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {expenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="hover:bg-zinc-900/50 transition-colors"
                                >
                                    <td className="p-5">
                                        <span className="text-zinc-400 font-bold text-xs">{formatDate(expense.date)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-white font-bold text-sm">{getVehicleName(expense.vehicleId)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800">
                                            {expense.type}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-400 text-sm font-medium">{expense.description}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-brand-red font-black text-sm">{formatCurrency(expense.cost)}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="p-2 hover:bg-blue-500/10 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors"
                                                title="Edit expense"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                                title="Delete expense"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Modal */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                expense={editingExpense}
            />
        </div>
    );
};

export default Expenses;
