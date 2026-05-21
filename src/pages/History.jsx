import React, { useState, useMemo } from 'react';
import { Search, Download, Clock, User, Tag, FileText, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import { formatDate } from '../utils/helpers';

const History = () => {
    const { auditLogs, loading } = useApp();
    const { t } = useLanguage();
    const [localSearch, setLocalSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const allowedActions = [
        { action: 'CREATE', entity: 'VEHICLE' },
        { action: 'CREATE', entity: 'CLIENT' },
        { action: 'CREATE', entity: 'BOOKING' },
        { action: 'CANCEL', entity: 'BOOKING' },
        { action: 'TERMINATE', entity: 'BOOKING' },
        { action: 'CREATE', entity: 'EXPENSE' }
    ];

    // Filter audit logs by search
    const filteredLogs = useMemo(() => {
        let logs = auditLogs;

        if (!localSearch) return logs;

        const search = localSearch.toLowerCase();
        return logs.filter(log =>
            (log.action_type || '').toLowerCase().includes(search) ||
            (log.entity_type || '').toLowerCase().includes(search) ||
            (log.details || '').toLowerCase().includes(search) ||
            (log.performed_by || '').toLowerCase().includes(search)
        );
    }, [auditLogs, localSearch]);

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

    const getActionBadgeClass = (type) => {
        switch (type) {
            case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'CANCEL': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'TERMINATE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-zinc-500/10 text-theme-secondary border-zinc-500/20';
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'BOOKING': return <Calendar className="w-4 h-4" />;
            case 'VEHICLE': return <Tag className="w-4 h-4" />;
            case 'CLIENT': return <User className="w-4 h-4" />;
            case 'EXPENSE': return <FileText className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('history.title')}</h1>
                <p className="text-theme-secondary font-medium tracking-tight">{t('history.subtitle')}</p>
            </div>

            {/* Search and Export */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <SearchBar
                    value={localSearch}
                    onChange={setLocalSearch}
                    placeholder={t('history.searchPlaceholder')}
                    className="w-full sm:w-96"
                />
                <Button variant="secondary" icon={Download} className="text-[10px] uppercase tracking-widest">
                    Export Audit Log
                </Button>
            </div>

            {/* Audit Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('history.table.timestamp')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('history.table.action')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('history.table.entity')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('history.table.details')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('history.table.performedBy')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-5">
                                        <span className="text-zinc-400 text-xs font-bold">{formatDate(log.created_at)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionBadgeClass(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            {getEntityIcon(log.entity_type)}
                                            {log.entity_type}
                                        </div>
                                    </td>
                                    <td className="p-5 text-left rtl:text-right">
                                        <p className="text-zinc-400 text-sm max-w-md line-clamp-2">{log.details}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                {log.performed_by?.charAt(0)}
                                            </div>
                                            <span className="text-zinc-400 text-xs font-bold">{log.performed_by}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                        >
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${currentPage === page
                                        ? 'bg-white text-black border-white'
                                        : 'text-zinc-500 border-zinc-800 hover:bg-zinc-900 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
