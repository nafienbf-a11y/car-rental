import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../context/NotificationContext';

const UserModal = ({ isOpen, onClose, onSuccess, user }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'staff'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                password: user.password || '',
                role: user.role || 'staff'
            });
        } else {
            setFormData({
                name: '',
                username: '',
                password: '',
                role: 'staff'
            });
        }
        setShowPassword(false);
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (user) {
                // Update
                const { error } = await supabase
                    .from('app_users')
                    .update(formData)
                    .eq('id', user.id);
                if (error) throw error;
                showNotification('User updated successfully', 'success');
            } else {
                // Insert
                const { error } = await supabase
                    .from('app_users')
                    .insert([formData]);
                if (error) throw error;
                showNotification('User created successfully', 'success');
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving user:", error);
            showNotification(error.message || 'Failed to save user', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Edit User' : 'Add New User'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Account Details</h3>
                            <p className="text-zinc-500 text-xs mt-0.5">Basic user information and credentials</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="E.g. Jane Doe"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Unique username"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter secure password"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors appearance-none"
                            >
                                <option value="staff">Staff - Read & write standard records</option>
                                <option value="admin">Admin - Full access including settings</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (user ? 'Save Changes' : 'Create User')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserModal;
