import React, { useState } from 'react';
import { DollarSign, Wrench, Plus, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import ExpenseModal from '../components/expenses/ExpenseModal';
import { formatDate, formatCurrency } from '../utils/helpers';
import { useNotification } from '../context/NotificationContext';

const Expenses = () => {
    const { expenses, vehicles, deleteExpense } = useApp();
    const { t } = useLanguage();
    const { showNotification, confirmAction } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const getVehicleName = (vehicleId) => {
        if (!vehicleId) return '-';
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : '-';
    };

    const getVehicle = (vehicleId) => {
        return vehicles.find(v => v.id === vehicleId);
    };

    const getCategoryColor = (category) => {
        const colors = {
            Oil: 'primary',
            Tires: 'warning',
            Insurance: 'success',
            Repair: 'danger',
        };
        return colors[category] || 'primary';
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: t('common.confirm') || 'Confirm',
            message: t('expenses.deleteConfirm') || "Are you sure you want to delete this expense?"
        });
        if (confirmed) {
            try {
                await deleteExpense(id);
                showNotification("Expense deleted successfully", 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">{t('expenses.title')}</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">{t('expenses.subtitle')}</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setIsModalOpen(true)}
                >
                    {t('expenses.addExpense')}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-brand-red" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('expenses.totalExpenses')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-zinc-400" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('expenses.maintenance')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{expenses.length}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-brand-blue" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('expenses.avgCost', 'Avg Cost')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                        {formatCurrency(totalExpenses / expenses.length || 0)}
                    </p>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{t('dashboard.recentActivity')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.date')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.vehicle')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.category')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.description')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.amount')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.actions')}</th>
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
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800 ${getCategoryColor(expense.category)}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-zinc-400 text-sm font-medium">{expense.description}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-brand-red font-black text-sm">{formatCurrency(expense.amount)}</span>
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
