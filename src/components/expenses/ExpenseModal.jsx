import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import { generateId } from '../../utils/helpers';

import { useNotification } from '../../context/NotificationContext';

const ExpenseModal = ({ isOpen, onClose, expense = null }) => {
    const { vehicles, addExpense, updateExpense } = useApp();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        // ... existing state
    });

    // ... existing useEffect

    const handleSubmit = (e) => {
        e.preventDefault();

        const expenseData = {
            id: expense?.id || generateId('exp-'),
            category: formData.type, // Map 'type' to 'category' for DB
            vehicleId: formData.vehicleId,
            amount: parseFloat(formData.cost), // Send 'amount' to match DB column
            description: formData.description,
            date: formData.date // Use selected date
        };

        if (expense) {
            updateExpense(expense.id, expenseData);
            showNotification('Expense updated successfully!', 'success');
        } else {
            addExpense(expenseData);
            showNotification('Expense added successfully!', 'success');
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">
                            {expense ? 'Edit Expense' : 'Add Expense'}
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">Track vehicle maintenance and costs</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Expense Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            required
                        >
                            <option value="Maintenance">Maintenance</option>
                            <option value="Car Wash">Car Wash</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Vehicle */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Vehicle *
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            required
                        >
                            <option value="">Select a vehicle</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model} ({vehicle.plate})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cost */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Cost (MAD) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                            rows="3"
                            placeholder="Additional details about this expense..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            {expense ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
