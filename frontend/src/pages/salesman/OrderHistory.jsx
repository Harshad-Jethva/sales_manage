import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Eye, Calendar, ChevronLeft, ChevronRight, Download, CheckCircle, Clock, Truck, X, MessageCircle, Check, User, Receipt, CalendarDays, ChevronDown, Trash2, Edit2, Save, ShoppingBag, Hash, CreditCard, LayoutGrid, PackageOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const [whatsappStatus, setWhatsappStatus] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [itemEditQty, setItemEditQty] = useState(1);
    const [editingOrder, setEditingOrder] = useState(false);
    const [orderEditNotes, setOrderEditNotes] = useState('');
    const [orderEditStatus, setOrderEditStatus] = useState('');

    // Client Autocomplete State
    const [clientSuggestions, setClientSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        start_date: '',
        end_date: '',
        page: 1,
        limit: 10
    });

    useEffect(() => {
        fetchOrders();
    }, [filters, user]);

    const fetchOrders = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { search, status, start_date, end_date, page, limit } = filters;
            const params = new URLSearchParams({
                salesman_id: user.id,
                search,
                status,
                start_date,
                end_date,
                page,
                limit
            });
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/orders.php?${params.toString()}`);
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/orders.php?order_id=${id}`);
            if (response.data.success) {
                setSelectedOrder(response.data.data);
                setShowModal(true);
                fetchWhatsAppStatus(id);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    // Auto-fetch client suggestions when search changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (filters.search.length > 1) {
                try {
                    const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/clients.php?search=${filters.search}`);
                    if (response.data.success) {
                        setClientSuggestions(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching clients:", error);
                }
            } else {
                setClientSuggestions([]);
            }
        };

        // Debounce slightly to prevent thrashing
        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters.search]);

    const handleSelectSuggestion = (client) => {
        setFilters({ ...filters, search: client.name, page: 1 });
        setShowSuggestions(false);
    };

    const fetchWhatsAppStatus = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:5000/whatsapp-status/${orderId}`);
            if (response.data.success) {
                setWhatsappStatus(response.data.data);
            } else {
                setWhatsappStatus(null);
            }
        } catch (error) {
            setWhatsappStatus(null);
        }
    };

    const handleSendWhatsApp = async (orderId) => {
        setSendingWhatsApp(true);
        try {
            // First ensure PDF is generated (proactive check)
            await axios.post('http://localhost:5000/generate-pdf', { order_id: orderId });

            const response = await axios.post('http://localhost:5000/send-whatsapp', { order_id: orderId });
            if (response.data.success) {
                toast.success('Invoice sent via WhatsApp!');
                fetchWhatsAppStatus(orderId);
            } else {
                toast.error(response.data.message || 'Failed to send WhatsApp');
            }
        } catch (error) {
            console.error("Error sending WhatsApp:", error);
            toast.error('Connection error with automation service');
        } finally {
            setSendingWhatsApp(false);
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await axios.post('http://localhost:5000/generate-pdf', { order_id: orderId });
            if (response.data.success) {
                window.open(`http://localhost/sales_manage/backend${response.data.pdf_url}`, '_blank');
            }
        } catch (error) {
            toast.error('Failed to generate PDF');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            try {
                const response = await axios.delete(`http://localhost/sales_manage/backend/api/salesman/orders.php?order_id=${orderId}`);
                if (response.data.success) {
                    toast.success('Order deleted successfully');
                    fetchOrders();
                    if (selectedOrder && selectedOrder.id === orderId) setShowModal(false);
                } else {
                    toast.error(response.data.message || 'Failed to delete order');
                }
            } catch (error) {
                console.error("Error deleting order:", error);
                toast.error('Connection error');
            }
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            try {
                const response = await axios.delete(`http://localhost/sales_manage/backend/api/salesman/orders.php?item_id=${itemId}`);
                if (response.data.success) {
                    toast.success('Item deleted successfully');
                    if (selectedOrder) {
                        fetchOrderDetails(selectedOrder.id);
                    }
                    fetchOrders();
                } else {
                    toast.error(response.data.message || 'Failed to delete item');
                }
            } catch (error) {
                console.error("Error deleting item:", error);
                toast.error('Connection error');
            }
        }
    };

    const handleUpdateItem = async (itemId) => {
        try {
            const response = await axios.put('http://localhost/sales_manage/backend/api/salesman/orders.php', {
                item_id: itemId,
                quantity: itemEditQty
            });
            if (response.data.success) {
                toast.success('Item quantity updated');
                setEditingItem(null);
                if (selectedOrder) {
                    fetchOrderDetails(selectedOrder.id);
                }
                fetchOrders();
            } else {
                toast.error(response.data.message || 'Failed to update item');
            }
        } catch (error) {
            console.error("Error updating item:", error);
            toast.error('Connection error');
        }
    };

    const handleUpdateOrder = async () => {
        try {
            const response = await axios.put('http://localhost/sales_manage/backend/api/salesman/orders.php', {
                order_id: selectedOrder.id,
                status: orderEditStatus,
                notes: orderEditNotes
            });
            if (response.data.success) {
                toast.success('Order details updated');
                setEditingOrder(false);
                if (selectedOrder) {
                    fetchOrderDetails(selectedOrder.id);
                }
                fetchOrders();
            } else {
                toast.error(response.data.message || 'Failed to update order');
            }
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error('Connection error');
        }
    };

    const startEditingOrder = () => {
        setOrderEditStatus(selectedOrder.status);
        setOrderEditNotes(selectedOrder.notes || '');
        setEditingOrder(true);
    };

    const startEditingItem = (item) => {
        setItemEditQty(item.quantity);
        setEditingItem(item.id);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
            case 'Ready':
            case 'Ready to Dispatch': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
            case 'Completed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20 shadow-[0_0_15px_rgba(107,114,128,0.15)]';
        }
    };

    const getStatusIcon = (status, size = 16) => {
        switch (status) {
            case 'Pending': return <Clock size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
            case 'Processing': return <PackageOpen size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
            case 'Ready':
            case 'Ready to Dispatch': return <Truck size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
            case 'Completed': return <CheckCircle size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
            case 'Cancelled': return <X size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
            default: return <Clock size={size} className="drop-shadow-[0_0_5px_currentColor]" />;
        }
    };

    return (
        <div className="order-history p-4 md:p-8 relative min-h-screen bg-[#050810] text-gray-200 font-sans overflow-hidden">
            <Helmet>
                <title>Order History | HAB CREATION</title>
            </Helmet>

            {/* Dynamic Background Effects */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse duration-10000"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000"></div>
            <div className="fixed top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 sm:max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500 tracking-tight drop-shadow-2xl mb-2">
                                Order Dashboard
                            </h1>
                            <p className="text-indigo-200/60 text-lg flex items-center gap-2">
                                <LayoutGrid size={18} /> Manage and track your transactions
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Filters Section - Glassmorphism Pill Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-3xl mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/[0.1] transition-colors"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="group space-y-2 relative">
                            <label className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-2">
                                <Search size={14} /> Search Client
                            </label>
                            <input
                                type="text"
                                placeholder="Name or Company..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-black/60 placeholder-white/20"
                                value={filters.search}
                                onChange={(e) => {
                                    setFilters({ ...filters, search: e.target.value, page: 1 });
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow click
                            />

                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && clientSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 left-0 right-0 bg-[#121826] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                                    >
                                        {clientSuggestions.map(client => (
                                            <div
                                                key={client.id}
                                                className="px-5 py-4 border-b border-white/5 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                                                onClick={() => handleSelectSuggestion(client)}
                                            >
                                                <h4 className="text-white font-bold">{client.name}</h4>
                                                <p className="text-xs text-indigo-300/60 font-medium mt-1">{client.company || 'Private Client'}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="group space-y-2">
                            <label className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={14} /> Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500/50 appearance-none focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer font-medium hover:bg-black/60"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Ready to Dispatch">Ready to Dispatch</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 group-hover:text-white transition-colors">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <label className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-2">
                                <CalendarDays size={14} /> From Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-black/60"
                                value={filters.start_date}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div className="group space-y-2">
                            <label className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-2">
                                <CalendarDays size={14} /> To Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-black/60"
                                value={filters.end_date}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ search: '', status: '', start_date: '', end_date: '', page: 1, limit: 10 })}
                                className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-5 py-3.5 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <X size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Reset Filters
                                </span>
                                <div className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Orders Grid View */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <PackageOpen className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                        </div>
                        <p className="mt-6 text-indigo-200/60 font-medium tracking-wide">Syncing data...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <>
                        <motion.div
                            initial="hidden" animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                            className="flex flex-col gap-4"
                        >
                            <AnimatePresence>
                                {orders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.98, y: 10 },
                                            visible: { opacity: 1, scale: 1, y: 0 }
                                        }}
                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                        className="relative group bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 rounded-2xl p-4 md:p-5 backdrop-blur-xl transition-all shadow-xl hover:shadow-[0_10px_40px_rgba(79,70,229,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6"
                                    >
                                        {/* Row Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                                        {/* Order Info */}
                                        <div className="flex items-center gap-4 min-w-[200px] xl:min-w-[240px]">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getStatusStyle(order.status)} shrink-0`}>
                                                {getStatusIcon(order.status, 20)}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg mb-0.5 tracking-wide">#{order.order_number}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusStyle(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                        <Calendar size={12} className="text-indigo-400" />
                                                        {new Date(order.order_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client & Amount Info */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 bg-black/20 rounded-xl p-3 border border-white/[0.02]">
                                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                                                    <User size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-widest leading-none mb-1">Client</p>
                                                    <p className="text-white font-medium text-sm md:text-base leading-tight truncate">{order.client_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end shrink-0 hidden md:flex">
                                                <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-widest mb-1">Total Value</p>
                                                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                                                    ₹{parseFloat(order.total_amount).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end shrink-0 md:hidden w-full border-t border-white/5 pt-2">
                                                <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-widest mb-1">Total Value</p>
                                                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                                                    ₹{parseFloat(order.total_amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 w-full md:w-auto relative z-10">
                                            <button
                                                onClick={() => fetchOrderDetails(order.id)}
                                                className="flex-1 md:flex-none bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 px-4 md:px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye size={16} /> <span className="md:hidden lg:inline">View</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownloadInvoice(order.id)}
                                                className="w-12 md:w-auto bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 px-0 md:px-4 py-2.5 rounded-xl transition-all flex items-center justify-center"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="w-12 md:w-auto bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-0 md:px-4 py-2.5 rounded-xl transition-all flex items-center justify-center"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-3xl backdrop-blur-md">
                            <p className="text-sm font-medium text-indigo-200/60 px-4">
                                Page <span className="text-white font-bold">{filters.page}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={filters.page === 1}
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    className="px-5 py-2.5 bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-30 disabled:hover:bg-black/40 transition-all flex items-center gap-2 text-sm font-bold"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <button
                                    disabled={orders.length < filters.limit}
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 hover:border-indigo-400 rounded-xl text-white disabled:opacity-30 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2 text-sm font-bold"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center backdrop-blur-md"
                    >
                        <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 text-indigo-400/50 border border-white/10">
                            <PackageOpen size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">No Orders Found</h3>
                        <p className="text-indigo-200/60 max-w-md mx-auto mb-8 text-lg">We couldn't find any orders matching your criteria. Try adjusting the filters.</p>
                        <button
                            onClick={() => setFilters({ search: '', status: '', start_date: '', end_date: '', page: 1, limit: 10 })}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {showModal && selectedOrder && (
                    <div className="fixed inset-0 z-[100] bg-[#0a0d17]">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-[100dvh] bg-[#0a0d17] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            {editingOrder ? (
                                                <select
                                                    className="bg-black/50 border border-indigo-500/50 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold text-lg"
                                                    value={orderEditStatus}
                                                    onChange={(e) => setOrderEditStatus(e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Ready to Dispatch">Ready to Dispatch</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            ) : (
                                                <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${getStatusStyle(selectedOrder.status)}`}>
                                                    {getStatusIcon(selectedOrder.status, 16)}
                                                    <span className="font-bold text-sm tracking-wide">{selectedOrder.status}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                                            Order #{selectedOrder.order_number}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-indigo-300/60 font-medium">
                                            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><Calendar size={14} className="text-indigo-400" /> {new Date(selectedOrder.order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className="hidden sm:flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5"><User size={14} className="text-indigo-400" /> by {selectedOrder.salesman_name}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 rounded-2xl text-gray-400 hover:text-rose-400 transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Client Box */}
                                    <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                                        <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <User size={14} /> Bill To
                                        </h4>
                                        <p className="text-white font-bold text-2xl mb-1">{selectedOrder.client_name}</p>
                                        <div className="absolute -bottom-6 -right-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                                            <User size={100} />
                                        </div>
                                    </div>

                                    {/* Summary Box */}
                                    <div className="bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors md:text-right">
                                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center md:justify-end gap-2 mb-4">
                                            <CreditCard size={14} /> Total Amount
                                        </h4>
                                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                                        <p className="text-emerald-300/60 font-medium mt-2">{selectedOrder.items.length} items in cart</p>
                                        <div className="absolute -top-6 -right-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                                            <ShoppingBag size={100} />
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="rounded-3xl border border-white/10 overflow-hidden bg-black/40 shadow-inner">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10 text-indigo-300/80 text-[11px] uppercase tracking-widest font-black">
                                                    <th className="p-5 pl-6">Product</th>
                                                    <th className="p-5 text-center">Unit Price</th>
                                                    <th className="p-5 text-center">Qty</th>
                                                    <th className="p-5 text-center">Disc</th>
                                                    <th className="p-5 text-right">Net Total</th>
                                                    <th className="p-5 pr-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm font-medium">
                                                {selectedOrder.items.map((item) => (
                                                    <tr key={item.id} className="text-gray-300 hover:bg-indigo-500/5 transition-colors group">
                                                        <td className="p-5 pl-6 text-white text-base">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                                                                    <PackageOpen size={18} />
                                                                </div>
                                                                {item.product_name}
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-center text-gray-400">₹{parseFloat(item.unit_price).toLocaleString()}</td>
                                                        <td className="p-5 text-center">
                                                            {editingItem === item.id ? (
                                                                <input
                                                                    type="number"
                                                                    className="w-20 bg-black/50 border border-indigo-500/50 rounded-xl py-1.5 px-3 text-center text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                                    value={itemEditQty}
                                                                    onChange={(e) => setItemEditQty(e.target.value)}
                                                                    min="1"
                                                                />
                                                            ) : (
                                                                <span className="bg-white/10 border border-white/10 px-4 py-1.5 rounded-xl text-white font-bold inline-block">{item.quantity}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-5 text-center text-emerald-400 bg-emerald-500/[0.02]">
                                                            {parseFloat(item.discount_percent)}%
                                                        </td>
                                                        <td className="p-5 text-right font-black text-white text-lg">₹{parseFloat(item.total_amount).toLocaleString()}</td>
                                                        <td className="p-5 pr-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                                {editingItem === item.id ? (
                                                                    <button onClick={() => handleUpdateItem(item.id)} className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                                        <Save size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => startEditingItem(item)} className="p-2.5 bg-white/5 hover:bg-indigo-500 text-gray-400 hover:text-white rounded-xl transition-all">
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 bg-white/5 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="mt-8">
                                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                                        <Hash size={14} /> Notes & Instructions
                                    </h4>
                                    {(editingOrder || (!selectedOrder.notes && editingOrder)) ? (
                                        <textarea
                                            className="w-full bg-black/40 border border-indigo-500/50 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium resize-none shadow-inner"
                                            value={orderEditNotes}
                                            onChange={(e) => setOrderEditNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Add internal notes or customer instructions here..."
                                        />
                                    ) : selectedOrder.notes ? (
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl text-indigo-100/80 leading-relaxed shadow-inner font-medium">
                                            "{selectedOrder.notes}"
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-gray-500 italic text-sm">
                                            No notes added for this order.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 md:p-8 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 backdrop-blur-xl">
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                        className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Download size={18} className="text-gray-400 group-hover:text-white transition-colors group-hover:-translate-y-1 transform duration-300" /> PDF
                                    </button>
                                    <button
                                        onClick={() => handleSendWhatsApp(selectedOrder.id)}
                                        disabled={sendingWhatsApp}
                                        className={`flex-[2] sm:flex-none px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${whatsappStatus?.whatsapp_status === 'Sent'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-green-600 hover:bg-green-500 border border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border-t-green-400'
                                            }`}
                                    >
                                        {sendingWhatsApp ? (
                                            <><div className="animate-spin h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full"></div> Sending...</>
                                        ) : whatsappStatus?.whatsapp_status === 'Sent' ? (
                                            <><Check size={18} /> Sent Successfully</>
                                        ) : (
                                            <><MessageCircle size={18} /> WhatsApp</>
                                        )}
                                    </button>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    {editingOrder ? (
                                        <>
                                            <button onClick={() => setEditingOrder(false)} className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
                                                Cancel
                                            </button>
                                            <button onClick={handleUpdateOrder} className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2">
                                                <Save size={18} /> Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={startEditingOrder} className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2">
                                                <Edit2 size={18} /> Edit
                                            </button>
                                            <button
                                                onClick={() => setShowModal(false)}
                                                className="flex-[2] sm:flex-none px-10 py-3.5 rounded-2xl bg-white text-black hover:bg-gray-200 font-extrabold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            >
                                                Done
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(99, 102, 241, 0.5);
                }
            `}</style>
        </div>
    );
};

export default OrderHistory;
