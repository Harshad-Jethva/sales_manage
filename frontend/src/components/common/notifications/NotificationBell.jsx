import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, ExternalLink, Clock,
    AlertCircle, CheckCircle2, XCircle,
    Paperclip, X, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const NotificationModal = ({ notification, onClose, onRespond, isResponding }) => {
    // Phase 5: Press ESC key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!notification) return null;

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ isolation: 'isolate' }}>
            {/* Dark overlay background - Click outside to close */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            {/* Phase 3 & 4: Centered Notification Modal UI */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header section */}
                <div className="flex-none p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-inner">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Notification Details</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock size={12} className="text-slate-500" />
                                <p className="text-slate-400 text-xs font-medium">{new Date(notification.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    {/* Close (X) button */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all hover:rotate-90 group"
                        title="Close"
                    >
                        <X size={20} className="group-hover:text-red-400" />
                    </button>
                </div>

                {/* Body section with Scroll support */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/50">
                    <div>
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Title</h3>
                        <h4 className="text-xl font-bold text-white tracking-tight">{notification.title}</h4>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Message Content</h3>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                                {notification.message}
                            </p>
                        </div>
                    </div>

                    {/* Attachment preview */}
                    {notification.attachment_path && (
                        <div className="space-y-3">
                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Attachment</h3>
                            <a
                                href={`http://localhost/sales_manage/${notification.attachment_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:bg-indigo-500/20 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                        <Paperclip size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-300">Linked Document</p>
                                        <p className="text-[10px] text-indigo-400/60 uppercase font-black">Click to view file</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer section */}
                <div className="flex-none p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                    {/* Buttons must be clearly styled and responsive */}
                    <div className="flex gap-3 w-full">
                        {notification.status === 'pending' ? (
                            <>
                                <button
                                    onClick={(e) => onRespond(e, notification.id, 'accepted')}
                                    disabled={isResponding}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold transition-all border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResponding ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    {isResponding ? 'PROCESSING...' : 'ACCEPT'}
                                </button>
                                <button
                                    onClick={(e) => onRespond(e, notification.id, 'rejected')}
                                    disabled={isResponding}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResponding ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                    {isResponding ? 'PROCESSING...' : 'REJECT'}
                                </button>
                            </>
                        ) : (
                            <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold uppercase tracking-widest ${notification.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {notification.status === 'accepted' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                {notification.status}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(
        <AnimatePresence>{content}</AnimatePresence>,
        document.body
    );
};

const NotificationBell = () => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isResponding, setIsResponding] = useState(false);

    const [selectedNotification, setSelectedNotification] = useState(null);

    const API_BASE = 'http://localhost/sales_manage/backend/api';

    useEffect(() => {
        if (user && token) {
            fetchNotifications();
        }
    }, [user, token]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (user && token) fetchNotifications();
        }, 60000);
        return () => clearInterval(interval);
    }, [user, token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        if (!user || !token) return;

        try {
            const response = await axios.get(`${API_BASE}/notifications.php?action=list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(response.data.data || []);
                setUnreadCount((response.data.data || []).filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Phase 1, 2, 6: Reliable Response Handling & Loading state
    const handleRespond = async (e, id, status) => {
        e.stopPropagation();
        if (isResponding) return; // Prevent duplicate responses
        setIsResponding(true);

        try {
            // Optimistic rendering
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status, is_read: true } : n));
            if (selectedNotification && selectedNotification.id === id) {
                setSelectedNotification(prev => ({ ...prev, status, is_read: true }));
            }

            const response = await axios.patch(`${API_BASE}/notifications.php`, {
                notification_id: id,
                action: 'respond',
                status: status
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || `Notification successfully ${status}`);
                fetchNotifications(); // Sync with backend
            } else {
                throw new Error(response.data.message || 'Server returned an error');
            }
        } catch (error) {
            console.error('Response API Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Response failed';
            toast.error(errorMsg);
            fetchNotifications(); // Revert optimistic update
        } finally {
            setIsResponding(false);
        }
    };

    const markRead = async (id) => {
        try {
            await axios.patch(`${API_BASE}/notifications.php`, {
                notification_id: id,
                action: 'mark_read'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Mark Read Error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.is_read);
            if (unread.length === 0) return;

            // Note: Batch API for mark_read would be better
            for (const n of unread) {
                await axios.patch(`${API_BASE}/notifications.php`, {
                    notification_id: n.id,
                    action: 'mark_read'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchNotifications();
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Mark all read failed');
        }
    };

    const openDetails = (notif) => {
        setSelectedNotification(notif);
        if (!notif.is_read) {
            markRead(notif.id);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all ${unreadCount > 0 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/10 text-slate-400 hover:text-white'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-900 animate-pulse-subtle">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
                            <div className="flex items-center gap-2">
                                <Bell size={18} className="text-indigo-400" />
                                <h3 className="font-bold text-white">Notifications</h3>
                            </div>
                            <button
                                onClick={markAllRead}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest disabled:opacity-50"
                                disabled={unreadCount === 0}
                            >
                                Mark All Read
                            </button>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-800">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => openDetails(n)}
                                            className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-all group ${!n.is_read ? 'bg-indigo-500/[0.03]' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 p-2 rounded-lg shrink-0 ${!n.is_read ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                    <AlertCircle size={16} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-slate-400'}`}>
                                                            {n.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed line-clamp-2 ${!n.is_read ? 'text-slate-300' : 'text-slate-500'}`}>
                                                        {n.message}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-3 overflow-x-hidden pt-1">
                                                        {n.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={(e) => handleRespond(e, n.id, 'accepted')}
                                                                    disabled={isResponding}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-emerald-500/20 disabled:opacity-50"
                                                                >
                                                                    <Check size={12} /> ACCEPT
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleRespond(e, n.id, 'rejected')}
                                                                    disabled={isResponding}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-red-500/20 disabled:opacity-50"
                                                                >
                                                                    <XCircle size={12} /> REJECT
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className={`w-full text-center py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${n.status === 'accepted' ? 'bg-emerald-500/5 text-emerald-500' : 'bg-red-500/5 text-red-500'}`}>
                                                                {n.status} Interaction
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                                    <div className="p-4 bg-slate-800/40 rounded-full text-slate-700">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-sm font-medium">No notifications for you yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-800/20 text-center border-t border-slate-800">
                            <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors">
                                View All History
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NotificationModal
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
                onRespond={handleRespond}
                isResponding={isResponding}
            />

            <style>{`
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.9; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
};

export default NotificationBell;
