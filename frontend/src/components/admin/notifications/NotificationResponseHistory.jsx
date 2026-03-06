import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Filter, Calendar, Clock, CheckCircle2, XCircle,
    HelpCircle, Eye, Shield,
    RefreshCw, ListFilter, Receipt
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

// Notification Response Tracker for Admin
const NotificationResponseHistory = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [selectedNotif, setSelectedNotif] = useState('all');

    const API_BASE = 'http://localhost/sales_manage/backend/api';

    useEffect(() => {
        if (user && token) {
            fetchHistory();
            fetchNotifications();
        }
    }, [user, token, filterStatus, filterRole, selectedNotif]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/notifications.php?action=recipient_history`;

            if (filterStatus !== 'all') url += `&status=${filterStatus}`;
            if (filterRole !== 'all') url += `&role=${filterRole}`;
            if (selectedNotif !== 'all') url += `&notification_id=${selectedNotif}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load response history');
        } finally {
            setLoading(false);
        }
    };

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> ACCEPTED</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-1 w-fit"><XCircle size={12} /> REJECTED</span>;
            default:
                return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-1 w-fit"><HelpCircle size={12} /> PENDING</span>;
        }
    };

    const filteredHistory = history.filter(item =>
        item.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Response Tracking
                    </h1>
                    <p className="text-slate-400 mt-1">Real-time status of sent notifications and user interactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchHistory}
                        className={`p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold tracking-wider text-[10px] uppercase">
                    <ListFilter size={14} /> Filter Management
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search user or notification..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/30 border border-slate-800 group-focus-within:bg-slate-800/60 group-focus-within:border-indigo-500/50 rounded-2xl text-white focus:outline-none transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Shield size={18} />
                        </div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/30 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                        >
                            <option value="all">All Roles</option>
                            {['admin', 'cashier', 'manager', 'accountant', 'salesman', 'warehouse'].map(role => (
                                <option key={role} value={role}>{role.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <CheckCircle2 size={18} />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/30 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Filter size={18} />
                        </div>
                        <select
                            value={selectedNotif}
                            onChange={(e) => setSelectedNotif(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/30 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                        >
                            <option value="all">All Notifications</option>
                            {notifications.map(n => (
                                <option key={n.id} value={n.id}>{n.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20">
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center w-16">#</th>
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">Notification Title</th>
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">Recipient</th>
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">Sent Date</th>
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">Track Status</th>
                                <th className="px-6 py-5 text-slate-400 font-bold text-[11px] uppercase tracking-widest">Interaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredHistory.length > 0 ? filteredHistory.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-indigo-500/5 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-slate-600 font-mono text-sm">{idx + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{item.title}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5">ID: NOT-{item.notification_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                                                {item.recipient_name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{item.recipient_name}</span>
                                                <span className="text-indigo-400/70 text-[10px] uppercase font-bold tracking-wider">{item.recipient_role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-slate-400 text-xs">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-600" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5 mt-1"><Clock size={12} className="text-slate-600" /> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.status)}
                                        {item.is_read && (
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase">
                                                <Eye size={10} /> Read at {new Date(item.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs text-slate-400">
                                            {item.response_at ? (
                                                <>
                                                    <span className="text-slate-500">Responded:</span>
                                                    <span className="font-semibold text-white">{new Date(item.response_at).toLocaleDateString()}</span>
                                                    <span className="text-slate-600">{new Date(item.response_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-600 italic">No interaction yet</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <Users size={40} className="mx-auto text-slate-800 mb-3" />
                                        {loading ? 'Crunching data...' : 'No response history found for the current selection'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotificationResponseHistory;
