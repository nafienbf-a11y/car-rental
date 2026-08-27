import React from 'react';
import Modal from '../common/Modal';
import { User, Mail, Phone, MapPin, FileText, Image } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ClientDetailModal = ({ isOpen, onClose, client }) => {
    const { t } = useLanguage();

    if (!client) return null;

    const documents = client.documents || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={client.name || t('clients.unknown')} size="lg">
            <div className="space-y-6">
                {/* Client Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme">
                        <div className="flex items-center gap-3 mb-1">
                            <User className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.fullName')}
                            </span>
                        </div>
                        <p className="text-theme-primary font-bold text-sm pl-7">{client.name || '-'}</p>
                    </div>

                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme">
                        <div className="flex items-center gap-3 mb-1">
                            <Mail className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.email')}
                            </span>
                        </div>
                        <p className="text-theme-primary font-bold text-sm pl-7">{client.email || '-'}</p>
                    </div>

                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme">
                        <div className="flex items-center gap-3 mb-1">
                            <Phone className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.phone')}
                            </span>
                        </div>
                        <p className="text-theme-primary font-bold text-sm pl-7">{client.phone || '-'}</p>
                    </div>

                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme">
                        <div className="flex items-center gap-3 mb-1">
                            <MapPin className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.address')}
                            </span>
                        </div>
                        <p className="text-theme-primary font-bold text-sm pl-7">{client.address || '-'}</p>
                    </div>

                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme md:col-span-2">
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.license')}
                            </span>
                        </div>
                        <p className="text-theme-primary font-bold text-sm font-mono pl-7">{client.licenseNumber || '-'}</p>
                    </div>
                </div>

                {/* Notes */}
                {client.notes && (
                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-4 h-4 text-brand-blue" />
                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">
                                {t('modals.client.notes')}
                            </span>
                        </div>
                        <p className="text-theme-secondary text-sm pl-7 whitespace-pre-wrap">{client.notes}</p>
                    </div>
                )}

                {/* Documents Section */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Image className="w-5 h-5 text-brand-blue" />
                        <h3 className="text-theme-primary font-bold">{t('modals.client.documents') || 'Documents'}</h3>
                        <span className="text-theme-secondary text-xs font-medium">({documents.length})</span>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="bg-theme-subcard p-4 rounded-xl border border-theme">
                                    <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest mb-3">
                                        {doc.name || 'Untitled Document'}
                                    </p>
                                    <div className="relative group">
                                        <img
                                            src={doc.data}
                                            alt={doc.name}
                                            className="w-full h-48 object-cover rounded-lg border border-theme cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(doc.data, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view full size
                                            </span>
                                        </div>
                                    </div>
                                    {doc.addedAt && (
                                        <p className="text-[10px] text-theme-tertiary mt-2">
                                            Added: {new Date(doc.addedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-theme border-dashed rounded-xl p-8 text-center">
                            <FileText className="w-10 h-10 text-theme-tertiary mx-auto mb-3" />
                            <p className="text-theme-secondary text-sm font-medium">No documents uploaded</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ClientDetailModal;
