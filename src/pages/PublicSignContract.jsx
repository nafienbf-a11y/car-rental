import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, ShieldCheck, FileText, Download, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { generateContractPDF } from '../utils/contractPdfGenerator';

const PublicSignContract = () => {
    const { token } = useParams();
    const { getContractByToken, signContractByToken, clients, vehicles, bookings } = useApp();
    const { t } = useLanguage();

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [signedSuccess, setSignedSuccess] = useState(false);

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    // Load contract details from token
    useEffect(() => {
        const fetchContract = async () => {
            setLoading(true);
            try {
                const data = await getContractByToken(token);
                if (!data) {
                    setError("Contract not found or invalid link.");
                } else {
                    setContract(data);
                }
            } catch (err) {
                console.error("Fetch contract error:", err);
                setError("Unable to load contract details.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchContract();
    }, [token]);

    // Setup High DPI Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = '#3b82f6'; // Bright blue signature stroke
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [contract, loading]);

    // Drawing helper functions
    const getPos = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        if (contract?.status === 'Signed' || submitting) return;
        isDrawingRef.current = true;
        const pos = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setHasDrawn(true);
    };

    const draw = (e) => {
        if (!isDrawingRef.current || contract?.status === 'Signed' || submitting) return;
        if (e.type === 'touchmove') {
            e.preventDefault(); // Prevent scrolling while signing
        }
        const pos = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleSignSubmit = async () => {
        if (!hasDrawn) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const signatureData = canvas.toDataURL('image/png');
        setSubmitting(true);
        setError(null);

        try {
            const updated = await signContractByToken(token, signatureData);
            setContract(updated);
            setSignedSuccess(true);
        } catch (err) {
            console.error("Signing error:", err);
            setError(err.message || "Failed to submit signature. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!contract) return;

        // Resolve snapshot or app state
        const client = contract.snapshotData?.client || clients?.find(c => c.id === contract.clientId) || {};
        const vehicle = contract.snapshotData?.vehicle || vehicles?.find(v => v.id === contract.vehicleId) || {};
        const booking = contract.snapshotData?.booking || bookings?.find(b => b.id === contract.bookingId) || {};

        const contractForPdf = {
            ...contract,
            adminStamp: contract.snapshotData?.adminStamp,
            adminSignature: contract.snapshotData?.adminSignature
        };

        generateContractPDF({ contract: contractForPdf, client, vehicle, booking }, true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                <div className="flex flex-col items-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-zinc-400 text-sm font-medium">Loading Contract Details...</p>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen bg-theme-bg text-theme-primary flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-theme-card border border-theme rounded-2xl p-6 text-center space-y-4 shadow-xl">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-white">Contract Error</h2>
                    <p className="text-zinc-400 text-sm">{error || "Contract invalid or no longer available."}</p>
                </div>
            </div>
        );
    }

    // Extract snapshot data or fallback
    const client = contract.snapshotData?.client || clients?.find(c => c.id === contract.clientId) || {};
    const vehicle = contract.snapshotData?.vehicle || vehicles?.find(v => v.id === contract.vehicleId) || {};
    const booking = contract.snapshotData?.booking || bookings?.find(b => b.id === contract.bookingId) || {};

    const isSigned = contract.status === 'Signed' || signedSuccess;

    return (
        <div className="min-h-screen bg-theme-bg text-theme-primary py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full space-y-6">

                {/* Header Brand */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 mb-1">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-theme-primary sm:text-3xl">
                        {t('contract.publicTitle')}
                    </h1>
                    <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                        {t('contract.contractNumber', { number: contract.contractNumber })}
                    </p>
                </div>

                {/* Status Alert Banner */}
                {isSigned ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-300">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-400" />
                        <div className="text-xs">
                            <p className="font-bold text-sm text-emerald-300">{t('contract.publicSigned')}</p>
                            <p className="text-emerald-400/80">
                                {t('contract.publicSignedOn')} {contract.signedAt ? new Date(contract.signedAt).toLocaleString() : 'Just now'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex items-center space-x-3 text-amber-300">
                        <ShieldCheck className="w-6 h-6 flex-shrink-0 text-amber-400" />
                        <div className="text-xs">
                            <p className="font-bold text-sm text-amber-200">{t('contract.publicRequired')}</p>
                            <p className="text-amber-400/80">{t('contract.publicRequiredDesc')}</p>
                        </div>
                    </div>
                )}

                {/* Contract Summary Card */}
                <div className="bg-theme-card border border-theme rounded-2xl p-5 space-y-5 shadow-2xl">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-theme-secondary pb-2 border-b border-theme">
                        {t('contract.summaryTitle')}
                    </h2>

                    {/* Client & Vehicle Quick Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                            <p className="text-theme-tertiary font-medium">{t('contract.clientName')}</p>
                            <p className="font-bold text-theme-primary text-sm">{client.name || 'N/A'}</p>
                            <p className="text-theme-secondary">{client.phone || ''}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-theme-tertiary font-medium">{t('contract.vehicle')}</p>
                            <p className="font-bold text-theme-primary text-sm">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-theme-secondary font-mono">{vehicle.plate}</p>
                        </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="bg-theme-subcard p-4 rounded-xl border border-theme grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                            <p className="text-theme-tertiary">{t('contract.startDate')}</p>
                            <p className="font-semibold text-theme-primary">{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-theme-tertiary">{t('contract.endDate')}</p>
                            <p className="font-semibold text-theme-primary">{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-theme-tertiary">{t('contract.totalPrice')}</p>
                            <p className="font-bold text-blue-400 text-sm">${booking.totalCost || booking.total_price || 0}</p>
                        </div>
                    </div>

                    {/* Terms Overview */}
                    <div className="space-y-2 text-xs text-theme-secondary bg-theme-subcard p-3 rounded-xl border border-theme">
                        <p className="font-semibold text-theme-primary">{t('contract.termsTitle')}</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                            <li>{t('contract.term1')}</li>
                            <li>{t('contract.term2')}</li>
                            <li>{t('contract.term3', { deposit: booking.securityDeposit || 0 })}</li>
                        </ul>
                    </div>
                </div>

                {/* Signature Pad or View Canvas */}
                <div className="bg-theme-card border border-theme rounded-2xl p-5 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-2">
                            {isSigned ? <Lock className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                            {isSigned ? t('contract.digitalSignatureRecord') : t('contract.signHere')}
                        </label>
                        {!isSigned && hasDrawn && (
                            <button
                                type="button"
                                onClick={clearCanvas}
                                className="text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
                            >
                                {t('contract.clear')}
                            </button>
                        )}
                    </div>

                    {isSigned ? (
                        <div className="bg-theme-input border border-theme rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px]">
                            {contract.signatureData ? (
                                <img
                                    src={contract.signatureData}
                                    alt="Client Signature"
                                    className="max-h-24 object-contain filter dark:invert"
                                />
                            ) : (
                                <p className="text-xs text-theme-tertiary italic">{t('contract.verifiedDigitalSignature')}</p>
                            )}
                            <p className="text-[10px] text-theme-tertiary mt-2 font-mono">{t('contract.verifiedDigitalSignature')}</p>
                        </div>
                    ) : (
                        <div className="relative bg-theme-input border-2 border-dashed border-theme focus-within:border-blue-500 rounded-xl overflow-hidden touch-none">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                touch-action="none"
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-40 cursor-crosshair block"
                            />
                            {!hasDrawn && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-theme-tertiary text-xs font-medium">
                                    {t('contract.drawSignatureHere')}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isSigned ? (
                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>{t('contract.downloadSignedPdf')}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={!hasDrawn || submitting}
                            onClick={handleSignSubmit}
                            className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${
                                hasDrawn && !submitting
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                                    : 'bg-theme-input text-theme-tertiary cursor-not-allowed border border-theme'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>{t('contract.submittingSignature')}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('contract.confirmAndSign')}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="text-center text-[10px] text-theme-tertiary font-mono">
                    {t('contract.systemFooter')}
                </div>
            </div>
        </div>
    );
};

export default PublicSignContract;
