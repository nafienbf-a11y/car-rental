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
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th 
            className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-theme-primary transition-colors group"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col">
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▲</span>
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▼</span>
                </div>
            </div>
        </th>
    );

    const sortedExpenses = [...(expenses || [])].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        let aVal, bVal;
        if (key === 'vehicleId') {
            aVal = getVehicleName(a.vehicleId).toLowerCase();
            bVal = getVehicleName(b.vehicleId).toLowerCase();
        } else if (key === 'amount') {
            aVal = Number(a.amount) || 0;
            bVal = Number(b.amount) || 0;
        } else if (key === 'date') {
            aVal = new Date(a.date).getTime();
            bVal = new Date(b.date).getTime();
        } else {
            aVal = a[key]?.toString().toLowerCase() || '';
            bVal = b[key]?.toString().toLowerCase() || '';
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage) || 1;
    const paginatedExpenses = sortedExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1 && itemsPerPage !== 999999) return null;
        if (itemsPerPage === 999999 && sortedExpenses.length === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-zinc-900/30 gap-4 border-b border-zinc-800">
                <span className="text-zinc-500 text-xs font-bold">
                    {t('common.showingEntries', { 
                        start: sortedExpenses.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1, 
                        end: Math.min(currentPage * itemsPerPage, sortedExpenses.length), 
                        total: sortedExpenses.length 
                    })}
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="flex items-center justify-center px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-theme-primary text-xs font-bold shadow-inner">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        );
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('expenses.title')}</h1>
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
                    <p className="text-3xl font-extrabold text-theme-primary tracking-tight">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-zinc-400" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('expenses.maintenance')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-theme-primary tracking-tight">{expenses.length}</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-brand-blue" />
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{t('expenses.avgCost', 'Avg Cost')}</p>
                    </div>
                    <p className="text-3xl font-extrabold text-theme-primary tracking-tight">
                        {formatCurrency(totalExpenses / expenses.length || 0)}
                    </p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-2">{t('common.showLabel')}</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-zinc-900 border border-zinc-800 text-theme-primary rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue cursor-pointer"
                    >
                        <option value={10}>{t('common.rowsCount', { count: 10 })}</option>
                        <option value={20}>{t('common.rowsCount', { count: 20 })}</option>
                        <option value={50}>{t('common.rowsCount', { count: 50 })}</option>
                        <option value={999999}>{t('common.allRows')}</option>
                    </select>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                {renderPagination()}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <SortableHeader label={t('expenses.table.date')} sortKey="date" />
                                <SortableHeader label={t('expenses.table.vehicle')} sortKey="vehicleId" />
                                <SortableHeader label={t('expenses.table.category')} sortKey="category" />
                                <SortableHeader label={t('expenses.table.description')} sortKey="description" />
                                <SortableHeader label={t('expenses.table.amount')} sortKey="amount" />
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('expenses.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {paginatedExpenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="hover:bg-zinc-900/50 transition-colors"
                                >
                                    <td className="p-5">
                                        <span className="text-zinc-400 font-bold text-xs">{formatDate(expense.date)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-theme-primary font-bold text-sm">{getVehicleName(expense.vehicleId)}</span>
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
