import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Send, Paperclip, Users, User, Shield,
    CheckCircle2, AlertCircle, X, Search, FileText,
    Calendar, Clock, Trash2, Filter, ChevronRight, Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

// Notification Center for Admin
const NotificationCenter = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showSendModal, setShowSendModal] = useState(false);
    const [roles, setRoles] = useState(['admin', 'cashier', 'manager', 'accountant', 'salesman', 'warehouse', 'client_panel']);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState(null);

    const API_BASE = 'http://localhost/sales_manage/backend/api';

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_type: 'all', // all, role, multiple_roles, specific_user
        target_values: '',
        attachment: null
    });

    useEffect(() => {
        if (user && token) {
            fetchNotifications();
            fetchUsers();
        }
    }, [user, token]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_BASE}/notifications.php?action=admin_list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE}/users.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();

        // Detailed Validation
        if (!formData.title.trim()) return toast.error('Enter a notification title');
        if (!formData.message.trim()) return toast.error('Enter your message content');

        if (formData.target_type !== 'all' && !formData.target_values) {
            return toast.error(`Please select a target ${formData.target_type === 'role' ? 'role' : 'user'}`);
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('message', formData.message.trim());
            data.append('target_type', formData.target_type);
            data.append('target_values', formData.target_values);

            if (formData.attachment) {
                data.append('attachment', formData.attachment);
            }

            const response = await axios.post(`${API_BASE}/notifications.php`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Notification broadcast successfully!');
                setShowSendModal(false);
                setFormData({
                    title: '',
                    message: '',
                    target_type: 'all',
                    target_values: '',
                    attachment: null
                });
                fetchNotifications();
            } else {
                toast.error(response.data.message || 'Operation failed on server');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Connection error';
            toast.error(`Error: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        try {
            const response = await axios.delete(`${API_BASE}/notifications.php?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Notification deleted');
                fetchNotifications();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Notification Center
                    </h1>
                    <p className="text-slate-400 mt-1">Manage system-wide broadcasts and user alerts</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSendModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Send size={18} />
                    <span>New Notification</span>
                </motion.button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sent', value: notifications.length, icon: Bell, color: 'blue' },
                    { label: 'Broadcast All', value: notifications.filter(n => n.total_recipients > 0).length, icon: Users, color: 'indigo' },
                    { label: 'Active Alerts', value: notifications.length > 5 ? 'High' : 'Normal', icon: Shield, color: 'emerald' },
                    { label: 'Response Rate', value: '78%', icon: CheckCircle2, color: 'amber' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-indigo-500/10 text-indigo-500`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-500" size={18} />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl text-white px-4 py-2 focus:outline-none"
                    >
                        <option value="all">All Targets</option>
                        <option value="broadcast">Broadcasts</option>
                        <option value="targeted">Targeted</option>
                    </select>
                </div>
            </div>

            {/* Notifications Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20">
                                <th className="px-6 py-4 text-slate-400 font-semibold text-sm">NOTIF DETAILS</th>
                                <th className="px-6 py-4 text-slate-400 font-semibold text-sm">DELIVERY TRACKING</th>
                                <th className="px-6 py-4 text-slate-400 font-semibold text-sm">STATS</th>
                                <th className="px-6 py-4 text-slate-400 font-semibold text-sm">DATE</th>
                                <th className="px-6 py-4 text-slate-400 font-semibold text-sm text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredNotifications.length > 0 ? filteredNotifications.map((n) => (
                                <tr key={n.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{n.title}</span>
                                            <span className="text-slate-500 text-xs line-clamp-1">{n.message}</span>
                                            {n.attachment_path && (
                                                <div className="flex items-center gap-1 mt-1 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Paperclip size={10} /> Attachment
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                                {n.total_recipients} Recip.
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <div className="flex flex-col text-xs">
                                                <span className="text-emerald-500">Read: {n.read_count}</span>
                                                <span className="text-amber-500">Resp: {parseInt(n.accepted_count) + parseInt(n.rejected_count)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs text-slate-400">
                                            <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedNotification(n)}
                                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(n.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Bell size={40} className="text-slate-800" />
                                            <p>No notifications found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Send Notification Modal */}
            <AnimatePresence>
                {showSendModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSendModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-lg">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Create Broadcast</h2>
                                        <p className="text-slate-400 text-sm">Send a message to specific users or roles</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSendModal(false)}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSendNotification} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-400">Notification Title</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g. New Product Launch alert"
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Target Audience</label>
                                        <select
                                            name="target_type"
                                            value={formData.target_type}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="all">Every System User</option>
                                            <option value="role">Specific Role</option>
                                            <option value="specific_user">Individual User</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Select {formData.target_type === 'role' ? 'Role' : 'User'}</label>
                                        {formData.target_type === 'all' ? (
                                            <div className="w-full bg-slate-800/20 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 italic">
                                                All users selected
                                            </div>
                                        ) : (
                                            <select
                                                name="target_values"
                                                value={formData.target_values}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                <option value="">Select Target...</option>
                                                {formData.target_type === 'role' ? roles.map(r => (
                                                    <option key={r} value={r}>{r.toUpperCase()}</option>
                                                )) : users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-400">Message Content</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Describe the update or alert clearly..."
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                            <Paperclip size={16} /> Attachment (Optional)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full bg-slate-800/50 border border-dashed border-slate-700 rounded-xl px-4 py-3 text-center transition-all group-hover:border-indigo-500/50">
                                                <span className="text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis block">
                                                    {formData.attachment ? formData.attachment.name : 'Click to select or drag & drop file'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowSendModal(false)}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Send Now</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Notification Detail Modal */}
            <AnimatePresence>
                {selectedNotification && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNotification(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white leading-tight">Notification Details</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock size={12} className="text-slate-500" />
                                            <p className="text-slate-500 text-xs">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:rotate-90"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Subject</h3>
                                    <h4 className="text-2xl font-bold text-white tracking-tight">{selectedNotification.title}</h4>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Message Content</h3>
                                    <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl">
                                        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                                            {selectedNotification.message}
                                        </p>
                                    </div>
                                </div>

                                {selectedNotification.attachment_path && (
                                    <div className="space-y-3">
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Attachment</h3>
                                        <a
                                            href={`http://localhost/sales_manage/${selectedNotification.attachment_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl group hover:bg-indigo-500/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                                    <Paperclip size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-indigo-400">Linked Document</p>
                                                    <p className="text-[10px] text-indigo-500/60 uppercase font-black">Open original file</p>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                    <div className="p-3 bg-slate-800/20 rounded-xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Recipients</p>
                                        <p className="text-white font-bold">{selectedNotification.total_recipients}</p>
                                    </div>
                                    <div className="p-3 bg-slate-800/20 rounded-xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Read Rate</p>
                                        <p className="text-white font-bold">{Math.round((selectedNotification.read_count / selectedNotification.total_recipients) * 100) || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
