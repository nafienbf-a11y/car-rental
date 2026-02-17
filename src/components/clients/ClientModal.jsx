import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

import { useLanguage } from '../../context/LanguageContext';
import { generateId } from '../../utils/helpers';

import { useNotification } from '../../context/NotificationContext';

const ClientModal = ({ isOpen, onClose, onSubmit, client }) => {
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        notes: '',
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                licenseNumber: client.licenseNumber || '',
                notes: client.notes || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                licenseNumber: '',
                notes: '',
            });
        }
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const clientData = {
            ...formData,
            id: client?.id || generateId(),
            createdAt: client?.createdAt || new Date().toISOString()
        };
        onSubmit(clientData);
        if (client) {
            showNotification(t('modals.client.notifications.updated'), 'success');
        } else {
            showNotification(t('modals.client.notifications.added'), 'success');
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={client ? t('modals.client.titleEdit') : t('modals.client.titleAdd')} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.fullName')} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder={t('modals.client.placeholderName')}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.email')} *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder={t('modals.client.placeholderEmail')}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.phone')} *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder={t('modals.client.placeholderPhone')}
                        />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.address')}
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder={t('modals.client.placeholderAddress')}
                        />
                    </div>

                    {/* License Number */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.license')}
                        </label>
                        <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder={t('modals.client.placeholderLicense')}
                        />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold resize-none"
                            placeholder={t('modals.client.placeholderNotes')}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        {t('modals.common.cancel')}
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                        {client ? t('modals.client.submitUpdate') : t('modals.client.submitAdd')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClientModal;
