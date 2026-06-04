import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, Edit2, Trash2, MapPin, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import ClientModal from '../components/clients/ClientModal';
import ClientDetailModal from '../components/clients/ClientDetailModal';

const Clients = () => {
    const { clients = [], addClient, updateClient, deleteClient, bookings = [] } = useApp();
    const { t } = useLanguage();
    const { showNotification, confirmAction } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [detailClient, setDetailClient] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddClient = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleSubmit = async (clientData) => {
        if (selectedClient) {
            const confirmed = await confirmAction({
                title: t('common.confirmUpdate') || 'Confirm Update',
                message: "Are you sure you want to modify this client?",
                type: 'warning'
            });
            if (!confirmed) return;
            updateClient(clientData.id, clientData);
        } else {
            addClient(clientData);
        }
    };

    const handleDeleteClient = async (id) => {
        const confirmed = await confirmAction({
            title: t('common.confirmDelete') || 'Confirm Deletion',
            message: t('clients.deleteConfirm'),
            type: 'danger'
        });

        if (confirmed) {
            try {
                await deleteClient(id);
                showNotification("Client deleted successfully", 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    // Filter clients by search term
    const filteredClients = (clients || []).filter(client => {
        if (!client) return false;
        const name = (client.name || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = client.phone || '';
        const term = searchTerm.toLowerCase();

        return name.includes(term) || email.includes(term) || phone.includes(term);
    });

    // Get client booking count
    const getClientBookingCount = (clientId) => {
        return bookings.filter(b => b.clientId === clientId).length;
    };

    // Sort clients dynamically
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th 
            className="text-left rtl:text-right py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col">
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▲</span>
                    <span className={`text-[8px] leading-[0.5] ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-brand-blue' : 'text-zinc-700 group-hover:text-zinc-500'}`}>▼</span>
                </div>
            </div>
        </th>
    );

    const sortedClients = [...filteredClients].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        let aVal, bVal;
        if (key === 'bookingsCount') {
            aVal = getClientBookingCount(a.id);
            bVal = getClientBookingCount(b.id);
        } else {
            aVal = a[key] || '';
            bVal = b[key] || '';
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedClients.length / itemsPerPage) || 1;
    const paginatedClients = sortedClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1 && itemsPerPage !== 999999) return null;
        if (itemsPerPage === 999999 && sortedClients.length === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-zinc-900/30 gap-4 border-b border-zinc-800">
                <span className="text-zinc-500 text-xs font-bold">
                    {t('common.showingEntries', { 
                        start: sortedClients.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1, 
                        end: Math.min(currentPage * itemsPerPage, sortedClients.length), 
                        total: sortedClients.length 
                    })}
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="flex items-center justify-center px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs font-bold shadow-inner">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <Button 
                        variant="secondary" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                        className="px-3 py-1 text-xs"
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('clients.title')}</h1>
                    <p className="text-theme-secondary font-medium tracking-tight">{t('clients.subtitle')}</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleAddClient}>
                    {t('clients.addClient')}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t('clients.totalClients')}</p>
                            <p className="text-2xl font-extrabold text-white">{clients.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t('clients.activeBookings')}</p>
                            <p className="text-2xl font-extrabold text-white">
                                {bookings.filter(b => b.status === 'Active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <Phone className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t('clients.newThisMonth')}</p>
                            <p className="text-2xl font-extrabold text-white">
                                {clients.filter(c => {
                                    const created = new Date(c.createdAt);
                                    const now = new Date();
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Rows Per Page */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                    <SearchBar
                        value={searchTerm}
                        onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                        placeholder={t('clients.searchPlaceholder')}
                    />
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 self-end sm:self-auto">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest pl-2">{t('common.showLabel')}</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue cursor-pointer"
                    >
                        <option value={10}>{t('common.rowsCount', { count: 10 })}</option>
                        <option value={20}>{t('common.rowsCount', { count: 20 })}</option>
                        <option value={50}>{t('common.rowsCount', { count: 50 })}</option>
                        <option value={999999}>{t('common.allRows')}</option>
                    </select>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                {renderPagination()}
                <div className="p-6 pt-2">
                    {sortedClients.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                {searchTerm ? t('clients.noClientsFound') : t('clients.noClientsYet')}
                            </h3>
                            <p className="text-zinc-500 mb-6">
                                {searchTerm ? t('clients.adjustSearch') : t('clients.startAdding')}
                            </p>
                            {!searchTerm && (
                                <Button variant="primary" icon={Plus} onClick={handleAddClient}>
                                    {t('clients.addFirst')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <SortableHeader label={t('clients.table.client')} sortKey="name" />
                                        <SortableHeader label={t('clients.table.contact')} sortKey="email" />
                                        <SortableHeader label={t('clients.table.license')} sortKey="licenseNumber" />
                                        <SortableHeader label={t('clients.table.bookings')} sortKey="bookingsCount" />
                                        <th className="text-right rtl:text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {t('clients.table.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(paginatedClients || []).map((client) => {
                                        if (!client) return null;
                                        return (
                                            <tr key={client.id || Math.random()} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                                                <td className="py-4 px-4 text-left rtl:text-right">
                                                    <div>
                                                        <p className="font-bold text-theme-primary">{client.name || t('clients.unknown')}</p>
                                                        {client.address && (
                                                            <p className="text-xs text-theme-secondary flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {client.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-left rtl:text-right">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-theme-primary flex items-center gap-2">
                                                            <Mail className="w-3.5 h-3.5 text-theme-secondary" />
                                                            {client.email || '-'}
                                                        </p>
                                                        <p className="text-sm text-theme-primary flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-theme-secondary" />
                                                            {client.phone || '-'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm text-theme-secondary font-mono">
                                                        {client.licenseNumber || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold">
                                                        {getClientBookingCount(client.id)} {t('clients.suffix')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => { setDetailClient(client); setIsDetailOpen(true); }}
                                                            className="p-2 hover:bg-brand-blue/10 rounded-lg text-theme-secondary hover:text-brand-blue transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClient(client)}
                                                            className="p-2 hover:bg-zinc-800 rounded-lg text-theme-secondary hover:text-theme-primary transition-colors"
                                                            title="Edit client"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClient(client.id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-theme-secondary hover:text-red-500 transition-colors"
                                                            title="Delete client"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Client Modal */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                client={selectedClient}
            />

            {/* Client Detail Modal */}
            <ClientDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setDetailClient(null); }}
                client={detailClient}
            />
        </div>
    );
};

export default Clients;
