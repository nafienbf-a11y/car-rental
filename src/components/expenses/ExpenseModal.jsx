import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { generateId } from '../../utils/helpers';

import { useNotification } from '../../context/NotificationContext';

const ExpenseModal = ({ isOpen, onClose, expense = null }) => {
    const { vehicles, addExpense, updateExpense } = useApp();
    const { t } = useLanguage();
    const { showNotification, confirmAction } = useNotification();
    const [formData, setFormData] = useState({
        type: 'maintenance',
        vehicleId: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const expenseTypes = [
        { id: 'maintenance', needsVehicle: true },
        { id: 'car_wash', needsVehicle: true },
        { id: 'fuel', needsVehicle: true },
        { id: 'vignette', needsVehicle: true },
        { id: 'accountant', needsVehicle: false },
        { id: 'agency_rent', needsVehicle: false },
        { id: 'salary', needsVehicle: false },
        { id: 'cnss', needsVehicle: false },
    ];

    const isVehicleRequired = expenseTypes.find(t => t.id === formData.type)?.needsVehicle ?? true;

    useEffect(() => {
        if (expense) {
            setFormData({
                type: expense.category || 'maintenance',
                vehicleId: expense.vehicleId || '',
                cost: expense.amount || '',
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || ''
            });
        } else {
            setFormData({
                type: 'maintenance',
                vehicleId: '',
                cost: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        }
    }, [expense, isOpen]);

    const handleSubmit = async (e) => {
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
            const confirmed = await confirmAction({
                title: t('common.confirm') || 'Confirm',
                message: t('confirm.update') || "Are you sure you want to modify this expense?"
            });
            if (!confirmed) return;
            updateExpense(expense.id, expenseData);
            showNotification(t('modals.expense.notifications.updated'), 'success');
        } else {
            addExpense(expenseData);
            showNotification(t('modals.expense.notifications.added'), 'success');
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={expense ? t('modals.expense.titleEdit') : t('modals.expense.titleAdd')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type */}
                <div>
                    <label className="block text-xs font-bold text-theme-secondary mb-2 uppercase tracking-wider">
                        {t('modals.expense.type')} *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent cursor-pointer"
                        required
                    >
                        {expenseTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {t(`expenses.types.${type.id}`) || type.id}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Vehicle - only show if type needs it */}
                {isVehicleRequired && (
                    <div>
                        <label className="block text-xs font-bold text-theme-secondary mb-2 uppercase tracking-wider">
                            {t('modals.expense.vehicle')} *
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full px-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent cursor-pointer"
                            required={isVehicleRequired}
                        >
                            <option value="">{t('modals.expense.selectVehicle')}</option>
                            {vehicles.filter(v => v.status !== 'Deleted').map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.brand} {vehicle.model} ({vehicle.plate})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Cost */}
                <div>
                    <label className="block text-xs font-bold text-theme-secondary mb-2 uppercase tracking-wider">
                        {t('modals.expense.cost')} *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent"
                        placeholder={t('modals.expense.placeholderCost')}
                        required
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-xs font-bold text-theme-secondary mb-2 uppercase tracking-wider">
                        {t('modals.expense.date')} *
                    </label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-theme-secondary mb-2 uppercase tracking-wider">
                        {t('modals.expense.description')}
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent resize-none"
                        rows="3"
                        placeholder={t('modals.expense.placeholderDesc')}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-theme">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {t('modals.common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                    >
                        {expense ? t('modals.expense.submitUpdate') : t('modals.expense.submitAdd')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExpenseModal;
