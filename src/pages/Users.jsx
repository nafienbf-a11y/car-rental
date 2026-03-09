import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import UserModal from '../components/users/UserModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { Navigate } from 'react-router-dom';

const Users = () => {
    const { t } = useLanguage();
    const { user: currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userToLogout, setUserToLogout] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching users", error);
            showNotification('Error fetching users', 'error');
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser]);

    if (currentUser?.role !== 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (id) => {
        if (id === currentUser.id) {
            showNotification('You cannot delete your own account.', 'error');
            return;
        }
        setUserToDelete(id);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        const { error } = await supabase.from('app_users').delete().eq('id', userToDelete);
        if (error) {
            console.error("Error deleting user", error);
            showNotification('Failed to delete user', 'error');
        } else {
            showNotification('User deleted successfully', 'success');
            fetchUsers();
        }
        setUserToDelete(null);
    };

    const handleForceLogout = (id) => {
        setUserToLogout(id);
    };

    const confirmForceLogout = async () => {
        if (!userToLogout) return;
        const { error } = await supabase.from('app_users').update({ is_active: false }).eq('id', userToLogout);
        if (error) {
            console.error("Error forcing logout", error);
            showNotification('Failed to log out user', 'error');
        } else {
            showNotification('User logged out successfully', 'success');
            fetchUsers();
        }
        setUserToLogout(null);
    };

    const handleModalSubmit = async () => {
        setIsModalOpen(false);
        await fetchUsers();
    };

    const filteredUsers = users.filter((u) => {
        const term = searchTerm.toLowerCase();
        return (
            (u.name || '').toLowerCase().includes(term) ||
            (u.username || '').toLowerCase().includes(term) ||
            (u.role || '').toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">User Management</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Manage admin and staff accounts</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleAddUser}>
                    Add User
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={searchTerm}
                        onChange={(val) => setSearchTerm(val)}
                        placeholder="Search by name, username, or role..."
                    />
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                        <p className="text-zinc-500 mb-6">No users match your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Username</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                                    <th className="text-left py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                    <th className="text-right py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4 px-4 font-bold text-white">{u.name || '-'}</td>
                                        <td className="py-4 px-4 text-zinc-300 font-mono text-sm">{u.username}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {u.is_active ? 'Online' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {currentUser?.username === 'gatibi' && u.is_active && u.id !== currentUser.id && (
                                                    <button onClick={() => handleForceLogout(u.id)} className="p-2 hover:bg-orange-500/10 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors" title="Force Logout">
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEditUser(u)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {u.username !== 'gatibi' && (
                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleModalSubmit}
                    user={selectedUser}
                />
            )}

            <ConfirmModal
                isOpen={!!userToLogout}
                onClose={() => setUserToLogout(null)}
                onConfirm={confirmForceLogout}
                title="Force Logout"
                message="Are you sure you want to forcibly log out this user?"
            />

            <ConfirmModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user?"
            />
        </div>
    );
};

export default Users;
