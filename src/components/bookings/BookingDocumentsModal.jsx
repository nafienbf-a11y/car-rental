import React, { useState } from 'react';
import Modal from '../common/Modal';
import { FileText, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const BookingDocumentsModal = ({ isOpen, onClose, booking }) => {
    const { t } = useLanguage();
    const [viewingImage, setViewingImage] = useState(null);

    if (!booking) return null;

    const documents = booking.documents || [];

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={t('bookings.viewDocuments') || 'Documents'} size="lg">
                <div className="space-y-6">
                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        {doc.name || 'Untitled Document'}
                                    </p>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => setViewingImage(doc)}
                                    >
                                        <img
                                            src={doc.data}
                                            alt={doc.name}
                                            className="w-full h-48 object-cover rounded-lg border border-zinc-700 hover:opacity-90 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view full size
                                            </span>
                                        </div>
                                    </div>
                                    {doc.addedAt && (
                                        <p className="text-[10px] text-zinc-600 mt-2">
                                            Added: {new Date(doc.addedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-zinc-800 border-dashed rounded-xl p-10 text-center">
                            <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-600 text-sm font-medium">No documents attached to this booking</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Full-size Image Lightbox */}
            {viewingImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setViewingImage(null)}
                >
                    <button
                        onClick={() => setViewingImage(null)}
                        className="absolute top-6 right-6 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full text-white transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={viewingImage.data}
                        alt={viewingImage.name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-bold bg-black/50 px-4 py-2 rounded-lg">
                        {viewingImage.name}
                    </p>
                </div>
            )}
        </>
    );
};

export default BookingDocumentsModal;
