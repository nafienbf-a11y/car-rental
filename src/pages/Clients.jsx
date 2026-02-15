import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, Edit2, Trash2, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import ClientModal from '../components/clients/ClientModal';

const Clients = () => {
    const { clients = [], addClient, updateClient, deleteClient, bookings = [] } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const handleAddClient = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleSubmit = (clientData) => {
        if (selectedClient) {
            updateClient(clientData.id, clientData);
        } else {
            addClient(clientData);
        }
    };

    const handleDeleteClient = (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            deleteClient(id);
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Clients</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Manage your customer database</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleAddClient}>
                    Add Client
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
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Clients</p>
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
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active Bookings</p>
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
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">New This Month</p>
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

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={searchTerm}
                        onChange={(val) => setSearchTerm(val)}
                        placeholder="Search by name, email, or phone..."
                    />
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            {searchTerm ? 'No clients found' : 'No clients yet'}
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            {searchTerm ? 'Try adjusting your search' : 'Add your first client to get started'}
                        </p>
                        {!searchTerm && (
                            <Button variant="primary" icon={Plus} onClick={handleAddClient}>
                                Add Your First Client
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Client
                                    </th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Contact
                                    </th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        License
                                    </th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Bookings
                                    </th>
                                    <th className="text-right py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(filteredClients || []).map((client) => {
                                    if (!client) return null;
                                    return (
                                        <tr key={client.id || Math.random()} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-bold text-white">{client.name || 'Unknown'}</p>
                                                    {client.address && (
                                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {client.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-zinc-300 flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                                        {client.email || '-'}
                                                    </p>
                                                    <p className="text-sm text-zinc-300 flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                                        {client.phone || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-zinc-400 font-mono">
                                                    {client.licenseNumber || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold">
                                                    {getClientBookingCount(client.id)} bookings
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClient(client)}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                        title="Edit client"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
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

            {/* Client Modal */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                client={selectedClient}
            />
        </div>
    );
};

export default Clients;
