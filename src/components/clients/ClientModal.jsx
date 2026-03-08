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
        cinPassport: '',
        permitPhoto: '',
        identityPhoto: '',
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
                cinPassport: client.cinPassport || '',
                permitPhoto: client.permitPhoto || '',
                identityPhoto: client.identityPhoto || '',
                notes: client.notes || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                licenseNumber: '',
                cinPassport: '',
                permitPhoto: '',
                identityPhoto: '',
                notes: '',
            });
        }
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
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

                    {/* CIN / Passport */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {t('modals.client.cinPassport') || 'CIN / Passport'}
                        </label>
                        <input
                            type="text"
                            name="cinPassport"
                            value={formData.cinPassport}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder="AB123456"
                        />
                    </div>

                    {/* Photo Uploads */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                {t('modals.client.permitPhoto') || 'Permit Photo'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'permitPhoto')}
                                className="hidden"
                                id="permitPhoto"
                            />
                            <label htmlFor="permitPhoto" className="cursor-pointer block w-full px-4 py-3 bg-zinc-900 border border-zinc-800 border-dashed rounded-xl text-sm text-zinc-500 text-center hover:border-zinc-700 transition-colors font-medium">
                                {formData.permitPhoto ? (
                                    <span className="text-green-500 font-bold flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Photo Selected
                                    </span>
                                ) : (
                                    'Click to upload Permit'
                                )}
                            </label>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                {t('modals.client.identityPhoto') || 'CIN / Passport Photo'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'identityPhoto')}
                                className="hidden"
                                id="identityPhoto"
                            />
                            <label htmlFor="identityPhoto" className="cursor-pointer block w-full px-4 py-3 bg-zinc-900 border border-zinc-800 border-dashed rounded-xl text-sm text-zinc-500 text-center hover:border-zinc-700 transition-colors font-medium">
                                {formData.identityPhoto ? (
                                    <span className="text-green-500 font-bold flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Photo Selected
                                    </span>
                                ) : (
                                    'Click to upload ID'
                                )}
                            </label>
                        </div>
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
