import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, Copy, Share2, Download, CheckCircle2, Clock, RefreshCw, Send, ShieldCheck, ExternalLink } from 'lucide-react';
import { generateContractPDF } from '../../utils/contractPdfGenerator';
import { supabase } from '../../lib/supabase';

const ContractModal = ({ isOpen, onClose, booking }) => {
    const { getContractByBookingId, createContract, updateContract, clients, vehicles, contracts } = useApp();
    const { showNotification } = useNotification();
    const { t } = useLanguage();

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [adminStamp, setAdminStamp] = useState(() => localStorage.getItem('admin_stamp_base64') || null);
    const [adminSignature, setAdminSignature] = useState(() => localStorage.getItem('admin_signature_base64') || null);
    const [tempAdminStamp, setTempAdminStamp] = useState(adminStamp);
    const [tempAdminSignature, setTempAdminSignature] = useState(adminSignature);
    const [isConfigChanged, setIsConfigChanged] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Admin signature drawing state
    const [hasDrawnAdmin, setHasDrawnAdmin] = useState(false);
    const adminCanvasRef = React.useRef(null);
    const isDrawingAdminRef = React.useRef(false);

    useEffect(() => {
        const initContract = async () => {
            if (!booking || !isOpen) return;
            setLoading(true);
            try {
                let ctr = getContractByBookingId(booking.id);
                if (!ctr) {
                    ctr = await createContract(booking.id);
                }

                // If existing contract snapshot doesn't have stamp/signature, but we have them in localStorage, sync to DB
                const lsStamp = localStorage.getItem('admin_stamp_base64');
                const lsSig = localStorage.getItem('admin_signature_base64');
                if (ctr && (lsStamp || lsSig)) {
                    const snapStamp = ctr.snapshotData?.adminStamp;
                    const snapSig = ctr.snapshotData?.adminSignature;
                    if ((lsStamp && !snapStamp) || (lsSig && !snapSig)) {
                        const newSnap = {
                            ...ctr.snapshotData,
                            adminStamp: snapStamp || lsStamp || null,
                            adminSignature: snapSig || lsSig || null
                        };
                        try {
                            ctr = await updateContract(ctr.id, { snapshot_data: newSnap });
                        } catch (e) {
                            console.error("Auto sync contract snapshot error:", e);
                        }
                    }
                }

                setContract(ctr);
            } catch (err) {
                console.error("Error initializing contract:", err);
                showNotification(`Failed to load or create contract: ${err.message || 'Unknown error'}`, "error");
            } finally {
                setLoading(false);
            }
        };
        initContract();
    }, [booking, isOpen]);

    const handleRefresh = async () => {
        if (!contract) return;
        setIsRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('id', contract.id)
                .single();
            if (error) throw error;
            
            // map from db format if needed (status, signatureData)
            const updated = {
                ...contract,
                status: data.status,
                signatureData: data.signature_data,
                signedAt: data.signed_at,
                snapshotData: data.snapshot_data
            };
            setContract(updated);
            showNotification("Contract status refreshed", "success");
        } catch (error) {
            console.error("Error refreshing contract:", error);
            showNotification("Failed to refresh contract status", "error");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Sync contract state with realtime updates from context
    useEffect(() => {
        if (contract && isOpen) {
            const latest = getContractByBookingId(booking.id);
            if (latest && (latest.status !== contract.status || latest.signatureData !== contract.signatureData)) {
                setContract(latest);
            }
        }
    }, [contracts]);

    // Setup Admin Signature Canvas
    useEffect(() => {
        const canvas = adminCanvasRef.current;
        if (!canvas || tempAdminSignature) return; // don't re-init if we already have a signature loaded

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [isOpen, tempAdminSignature]);

    // Drawing helper functions
    const getPos = (e) => {
        const canvas = adminCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawingAdmin = (e) => {
        isDrawingAdminRef.current = true;
        const pos = getPos(e);
        const ctx = adminCanvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setHasDrawnAdmin(true);
        setIsConfigChanged(true);
    };

    const drawAdmin = (e) => {
        if (!isDrawingAdminRef.current) return;
        if (e.type === 'touchmove') e.preventDefault();
        const pos = getPos(e);
        const ctx = adminCanvasRef.current.getContext('2d');
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawingAdmin = () => {
        if (isDrawingAdminRef.current) {
            isDrawingAdminRef.current = false;
            setIsConfigChanged(true);
        }
    };

    if (!booking) return null;

    const client = clients.find(c => c.id === booking.clientId) || {};
    const vehicle = vehicles.find(v => v.id === booking.vehicleId) || {};

    const signUrl = `${window.location.origin}${window.location.pathname}#/contract/sign/${contract?.signatureToken || ''}`;

    const handleCopyLink = () => {
        if (!signUrl) return;
        navigator.clipboard.writeText(signUrl);
        setCopied(true);
        showNotification("Contract signature link copied to clipboard!", "success");
        setTimeout(() => setCopied(false), 3000);
    };

    const handleShareWhatsApp = () => {
        const rawPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
        const message = encodeURIComponent(
            `Hello ${client.name || 'Valued Client'},\n\nPlease review and sign your car rental agreement for the ${vehicle.brand || ''} ${vehicle.model || ''} using this secure link:\n\n${signUrl}\n\nThank you!`
        );
        const waUrl = rawPhone ? `https://wa.me/${rawPhone}?text=${message}` : `https://wa.me/?text=${message}`;
        window.open(waUrl, '_blank');
    };

    const handleStampUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setTempAdminStamp(event.target.result);
                setIsConfigChanged(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearStamp = () => {
        setTempAdminStamp(null);
        setIsConfigChanged(true);
    };

    const handleClearSignature = () => {
        setTempAdminSignature(null);
        setIsConfigChanged(true);
    };

    const handleSaveConfig = async () => {
        let finalSignature = tempAdminSignature;
        if (!finalSignature && adminCanvasRef.current && hasDrawnAdmin) {
            finalSignature = adminCanvasRef.current.toDataURL('image/png');
            setTempAdminSignature(finalSignature);
        }

        setAdminStamp(tempAdminStamp);
        setAdminSignature(finalSignature);
        
        if (tempAdminStamp) localStorage.setItem('admin_stamp_base64', tempAdminStamp);
        else localStorage.removeItem('admin_stamp_base64');
        
        if (finalSignature) localStorage.setItem('admin_signature_base64', finalSignature);
        else localStorage.removeItem('admin_signature_base64');
        
        // Update contract snapshot in DB so client can see the stamp/signature
        try {
            const newSnapshot = { ...contract.snapshotData, adminStamp: tempAdminStamp, adminSignature: finalSignature };
            await updateContract(contract.id, { snapshot_data: newSnapshot });
            
            // Also update local state
            setContract(prev => ({ ...prev, snapshotData: newSnapshot, adminStamp: tempAdminStamp, adminSignature: finalSignature }));
            
            setIsConfigChanged(false);
            showNotification("Lessor configuration saved and applied to contract", "success");
        } catch (err) {
            console.error("Error saving config to contract:", err);
            showNotification("Failed to apply configuration to contract", "error");
        }
    };

    const handleDownloadPDF = () => {
        if (!contract) return;
        const contractWithStamp = { ...contract, adminStamp, adminSignature };
        generateContractPDF({ contract: contractWithStamp, client, vehicle, booking }, true);
    };

    const isSigned = contract?.status === 'Signed';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('contract.modalTitle')} size="lg">
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-zinc-400 text-sm font-medium">{t('common.showing') || 'Loading...'}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Top Status & Contract Badge */}
                    <div className="bg-theme-subcard border border-theme rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className={`p-3 rounded-xl border ${isSigned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-mono font-bold text-theme-secondary">
                                    {t('contract.contractNumber', { number: contract?.contractNumber || '---' })}
                                </p>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-0.5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        isSigned 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                        {isSigned ? <CheckCircle2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" /> : <Clock className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />}
                                        {isSigned ? t('contract.statusSigned') : t('contract.statusPending')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="w-full sm:w-auto px-4 py-2 bg-theme-input hover:bg-theme-border text-theme-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 border border-theme"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{t('contract.refresh')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                            >
                                <Download className="w-4 h-4" />
                                <span>{t('contract.downloadPdf')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="bg-theme-subcard p-4 rounded-xl border border-theme space-y-2">
                            <p className="text-theme-tertiary font-bold uppercase tracking-wider text-[10px]">{t('contract.clientDetails')}</p>
                            <p className="font-bold text-theme-primary text-sm">{client.name || 'N/A'}</p>
                            <p className="text-theme-secondary">{t('contract.phone')}: {client.phone || 'N/A'}</p>
                            <p className="text-theme-secondary">{t('contract.cin')}: {client.cinPassport || client.cin_passport || 'N/A'}</p>
                        </div>

                        <div className="bg-theme-subcard p-4 rounded-xl border border-theme space-y-2">
                            <p className="text-theme-tertiary font-bold uppercase tracking-wider text-[10px]">{t('contract.vehicleDetails')}</p>
                            <p className="font-bold text-theme-primary text-sm">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-theme-secondary">{t('contract.plate')}: {vehicle.plate}</p>
                            <p className="text-theme-secondary">{t('contract.rates')}: ${vehicle.pricePerDay || 0}/{t('catalog.day')} • {t('contract.total')}: ${booking.totalCost || 0}</p>
                        </div>
                    </div>

                    {/* Signature Status & Link Sharing Section */}
                    <div className="bg-theme-subcard border border-theme rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            {t('contract.clientLinkTitle')}
                        </h3>

                        <p className="text-xs text-theme-secondary">
                            {t('contract.clientLinkDesc')}
                        </p>

                        {/* Link Input Bar */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <input
                                type="text"
                                readOnly
                                value={signUrl}
                                className="flex-1 bg-theme-input border border-theme rounded-xl px-3 py-2 text-xs font-mono text-theme-primary focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="px-3 py-2 bg-theme-input hover:bg-theme-border text-theme-primary border border-theme font-medium text-xs rounded-xl transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copied ? t('contract.copied') : t('contract.copy')}</span>
                            </button>
                            <a
                                href={signUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-theme-input hover:bg-theme-border text-theme-primary border border-theme font-medium text-xs rounded-xl transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{t('contract.open')}</span>
                            </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleShareWhatsApp}
                                className="flex-1 py-2.5 px-4 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                            >
                                <Send className="w-4 h-4" />
                                <span>{t('contract.shareWhatsApp')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Admin / Lessor Stamp & Signature Section */}
                    <div className="bg-theme-subcard border border-theme rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-theme pb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                                {t('contract.lessorSectionTitle')}
                            </h3>
                            {isConfigChanged && (
                                <button
                                    onClick={handleSaveConfig}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {t('contract.saveConfig')}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-theme-secondary">
                            {t('contract.lessorDesc')}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Stamp Upload */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-theme-tertiary uppercase">{t('contract.agencyStamp')}</p>
                                    {tempAdminStamp && (
                                        <button onClick={handleClearStamp} className="text-[10px] text-red-400 hover:text-red-300">{t('contract.clear')}</button>
                                    )}
                                </div>
                                {tempAdminStamp ? (
                                    <div className="bg-theme-input border border-theme rounded-xl p-3 flex justify-center h-24">
                                        <img src={tempAdminStamp} alt="Admin Stamp" className="max-h-full object-contain filter dark:invert" />
                                    </div>
                                ) : (
                                    <div className="relative h-24">
                                        <input type="file" accept="image/png, image/jpeg" onChange={handleStampUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="h-full bg-theme-input border border-dashed border-theme hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center transition-colors">
                                            <span className="text-[10px] text-blue-400 font-medium">{t('contract.uploadStamp')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Signature Draw Pad */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-theme-tertiary uppercase">{t('contract.adminSignature')}</p>
                                    {tempAdminSignature && (
                                        <button onClick={() => { handleClearSignature(); setHasDrawnAdmin(false); }} className="text-[10px] text-red-400 hover:text-red-300">{t('contract.clear')}</button>
                                    )}
                                </div>
                                {tempAdminSignature ? (
                                    <div className="bg-theme-input border border-theme rounded-xl p-3 flex justify-center h-24">
                                        <img src={tempAdminSignature} alt="Admin Signature" className="max-h-full object-contain filter dark:invert" />
                                    </div>
                                ) : (
                                    <div 
                                        className="relative h-24 bg-theme-input border border-dashed border-theme hover:border-blue-500/50 rounded-xl overflow-hidden touch-none transition-colors"
                                        onMouseLeave={stopDrawingAdmin}
                                        onMouseUp={stopDrawingAdmin}
                                        onTouchEnd={stopDrawingAdmin}
                                    >
                                        <canvas
                                            ref={adminCanvasRef}
                                            onMouseDown={startDrawingAdmin}
                                            onMouseMove={drawAdmin}
                                            onTouchStart={startDrawingAdmin}
                                            onTouchMove={drawAdmin}
                                            className="w-full h-full cursor-crosshair"
                                        />
                                        {!hasDrawnAdmin && (
                                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                                <span className="text-[10px] text-blue-400/50 font-medium">{t('contract.drawSignatureHere')}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Signature Preview Box if signed */}
                    {isSigned && (
                        <div className="bg-theme-subcard border border-theme rounded-2xl p-4 space-y-2">
                            <p className="text-[10px] font-bold text-theme-tertiary uppercase tracking-widest">
                                {t('contract.clientSignatureImage')}
                            </p>
                            <div className="bg-theme-input border border-theme rounded-xl p-3 flex flex-col items-center justify-center">
                                {contract.signatureData ? (
                                    <img
                                        src={contract.signatureData}
                                        alt="Client Signature"
                                        className="max-h-20 object-contain filter dark:invert"
                                    />
                                ) : (
                                    <p className="text-xs text-theme-tertiary italic">{t('contract.verifiedDigitalSignature')}</p>
                                )}
                                {contract.signedAt && (
                                    <p className="text-[10px] text-emerald-400 mt-2 font-semibold">
                                        {t('contract.publicSignedOn')}: {new Date(contract.signedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default ContractModal;
