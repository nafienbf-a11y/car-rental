import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

import { useLanguage } from '../../context/LanguageContext';
import { generateId } from '../../utils/helpers';

import { useNotification } from '../../context/NotificationContext';
import { compressImage } from '../../utils/imageCompressor';

const ClientModal = ({ isOpen, onClose, onSubmit, client }) => {
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        documents: [],
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
                documents: client.documents || [],
                notes: client.notes || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                licenseNumber: '',
                documents: [],
                notes: '',
            });
        }
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDocument = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.7 });
                const newDoc = {
                    id: Date.now().toString(),
                    name: file.name.replace(/\.[^/.]+$/, ''), // filename without extension
                    data: compressed,
                    addedAt: new Date().toISOString(),
                };
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents, newDoc]
                }));
            } catch (err) {
                console.error('Image compression failed:', err);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newDoc = {
                        id: Date.now().toString(),
                        name: file.name.replace(/\.[^/.]+$/, ''),
                        data: reader.result,
                        addedAt: new Date().toISOString(),
                    };
                    setFormData(prev => ({
                        ...prev,
                        documents: [...prev.documents, newDoc]
                    }));
                };
                reader.readAsDataURL(file);
            }
        }
        // Reset file input
        e.target.value = '';
    };

    const handleRemoveDocument = (docId) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter(d => d.id !== docId)
        }));
    };

    const handleDocNameChange = (docId, newName) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map(d =>
                d.id === docId ? { ...d, name: newName } : d
            )
        }));
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
                    <div className="md:col-span-2">
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

                    {/* Documents Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {t('modals.client.documents') || 'Documents'}
                            </label>
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-lg text-xs font-bold transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                                {t('modals.client.addDocument') || 'Add Document'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAddDocument}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {formData.documents.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {formData.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl group">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                                            <img
                                                src={doc.data}
                                                alt={doc.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Name input */}
                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={doc.name}
                                                onChange={(e) => handleDocNameChange(doc.id, e.target.value)}
                                                className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-zinc-700 focus:border-zinc-600 rounded-lg text-white text-sm font-medium focus:outline-none transition-colors"
                                                placeholder={t('modals.client.documentName') || 'Document name'}
                                            />
                                            <p className="text-[10px] text-zinc-600 mt-0.5 px-3">
                                                {new Date(doc.addedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(doc.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-zinc-800 border-dashed rounded-xl p-6 text-center">
                                <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                <p className="text-zinc-600 text-sm">No documents uploaded yet</p>
                            </div>
                        )}
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
