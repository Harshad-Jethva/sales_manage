import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Search, Filter, Eye, CheckCircle, Clock,
    ArrowRight, User, ShoppingBag, Calendar, ChevronRight,
    ClipboardList, AlertCircle, RefreshCw, X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

const ReceiveOrder = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [salesmanFilter, setSalesmanFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchSalesmen();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost/sales_manage/backend/api/salesman/orders.php');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesmen = async () => {
        try {
            const response = await axios.get('http://localhost/sales_manage/backend/api/users.php?role=salesman');
            if (response.data.success) {
                setSalesmen(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching salesmen:", error);
        }
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/orders.php?order_id=${orderId}`);
            if (response.data.success) {
                setSelectedOrder(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching order detail:", error);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        fetchOrderDetail(order.id);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingStatus(orderId);
        try {
            const response = await axios.put('http://localhost/sales_manage/backend/api/salesman/orders.php', {
                order_id: orderId,
                status: newStatus
            });
            if (response.data.success) {
                toast.success(`Order set to ${newStatus}`);
                fetchOrders();
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                toast.error(response.data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Connection error while updating status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.salesman_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        const matchesSalesman = salesmanFilter === 'All' || order.salesman_id?.toString() === salesmanFilter;

        return matchesSearch && matchesStatus && matchesSalesman;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Ready':
            case 'Ready to Dispatch': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Completed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Delivered': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const nextStatus = {
        'Pending': 'Processing',
        'Processing': 'Ready to Dispatch',
        'Ready to Dispatch': 'Completed',
        'Completed': null
    };

    return (
        <div className="receive-order-page p-4 lg:p-8 min-h-screen">
            <Helmet>
                <title>Receive Orders | Warehouse Panel</title>
            </Helmet>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Package className="text-indigo-500" size={32} />
                        Receive & Process Orders
                    </h1>
                    <p className="text-gray-400 mt-1">Manage orders placed by salesmen and prepare them for dispatch.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOrders}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-white transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Pending Orders', count: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Processing', count: orders.filter(o => o.status === 'Processing').length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Ready to Dispatch', count: orders.filter(o => (o.status === 'Ready' || o.status === 'Ready to Dispatch')).length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Total Recent', count: orders.length, icon: ClipboardList, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-6 space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Order #, Client or Salesman..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-full lg:w-64">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all font-medium appearance-none cursor-pointer"
                                value={salesmanFilter}
                                onChange={(e) => setSalesmanFilter(e.target.value)}
                            >
                                <option value="All">All Salesmen</option>
                                {salesmen.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {['All', 'Pending', 'Processing', 'Ready to Dispatch', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap border ${statusFilter === status
                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="p-5">Order Details</th>
                                <th className="p-5">Client & Salesman</th>
                                <th className="p-5">Items</th>
                                <th className="p-5">Amount</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="p-8 text-center bg-white/5">
                                            <div className="h-4 bg-white/10 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-5">
                                            <div className="font-bold text-white text-base">#{order.order_number}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5">
                                                <Calendar size={13} className="text-gray-600" />
                                                {new Date(order.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-white font-semibold flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                                                    <User size={14} className="text-indigo-400" />
                                                </div>
                                                {order.client_name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2 ml-9 flex items-center gap-1.5">
                                                <ShoppingBag size={13} className="text-gray-600" />
                                                <span className="text-indigo-400/80 font-medium">By: {order.salesman_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="bg-white/5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-300">
                                                <ClipboardList size={13} className="text-indigo-400" />
                                                {order.items_count || 0} Products
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-white font-black text-base">₹{parseFloat(order.total_amount).toLocaleString()}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className={`bg-transparent text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border outline-none cursor-pointer hover:brightness-110 transition-all ${getStatusColor(order.status)}`}
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    disabled={updatingStatus === order.id}
                                                >
                                                    <option value="Pending" className="text-white bg-[#0f172a]">Pending</option>
                                                    <option value="Processing" className="text-white bg-[#0f172a]">Processing</option>
                                                    <option value="Ready to Dispatch" className="text-white bg-[#0f172a]">Ready to Dispatch</option>
                                                    <option value="Completed" className="text-white bg-[#0f172a]">Completed</option>
                                                    <option value="Cancelled" className="text-white bg-[#0f172a]">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => handleViewDetail(order)}
                                                    className="p-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </button>

                                                {nextStatus[order.status] && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, nextStatus[order.status])}
                                                        disabled={updatingStatus === order.id}
                                                        className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 group/btn ${order.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white shadow-blue-500/10' :
                                                            order.status === 'Processing' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-emerald-500/10' :
                                                                'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white shadow-indigo-500/10'
                                                            }`}
                                                        title={`Move to ${nextStatus[order.status]}`}
                                                    >
                                                        {updatingStatus === order.id ? (
                                                            <RefreshCw size={20} className="animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">
                                                                    Mark {nextStatus[order.status]}
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2">
                                                <AlertCircle size={40} className="text-gray-700" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-400">No orders found</p>
                                            <p className="text-gray-600 max-w-xs mx-auto text-sm">We couldn't find any orders matching your current search or filter criteria.</p>
                                            <button
                                                onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSalesmanFilter('All'); }}
                                                className="mt-4 text-indigo-400 font-bold text-sm hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setShowDetailModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-[#0f172a] border border-white/10 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-white">Order #{selectedOrder.order_number}</h2>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Warehouse Fulfillment Dashboard</p>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white p-3 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <User size={80} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Customer Details</h4>
                                        <p className="text-white text-lg font-bold">{selectedOrder.client_name}</p>
                                        <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-2">
                                            <Package size={14} className="text-gray-600" />
                                            {selectedOrder.client_company}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                            <Clock size={14} className="text-gray-600" />
                                            {selectedOrder.client_phone}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShoppingBag size={80} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Origin Information</h4>
                                        <p className="text-white text-lg font-bold">Salesman: {selectedOrder.salesman_name}</p>
                                        <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-600" />
                                            Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
                                                ID: {selectedOrder.salesman_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <ClipboardList size={18} className="text-indigo-400" />
                                    Order Items ({selectedOrder.items?.length || 0})
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder.items ? selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-lg border border-indigo-500/10">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-base">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">Price: ₹{item.unit_price} / unit</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-0.5">
                                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Qty:</span>
                                                    <p className="text-white font-black text-lg">{item.quantity}</p>
                                                </div>
                                                <p className="text-indigo-400 font-black text-sm">₹{parseFloat(item.total_amount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                            <p className="text-gray-500 italic text-sm">Product list loading or unavailable...</p>
                                        </div>
                                    )}
                                </div>

                                {selectedOrder.notes && (
                                    <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Order Notes</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">{selectedOrder.notes}</p>
                                    </div>
                                )}

                                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Settlement</p>
                                        <p className="text-5xl font-black text-white tracking-tight">
                                            <span className="text-indigo-500 mr-2">₹</span>
                                            {parseFloat(selectedOrder.total_amount).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                        {/* Status Update Facility */}
                                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                                            <select
                                                className="bg-[#1e293b] text-white font-bold text-sm px-4 py-2.5 rounded-xl border border-white/10 outline-none cursor-pointer focus:border-indigo-500/50"
                                                value={selectedOrder.status}
                                                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                                disabled={updatingStatus === selectedOrder.id}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Ready to Dispatch">Ready to Dispatch</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>

                                            {nextStatus[selectedOrder.status] && (
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedOrder.id, nextStatus[selectedOrder.status])}
                                                    disabled={updatingStatus === selectedOrder.id}
                                                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 text-white ${selectedOrder.status === 'Pending' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                                                        selectedOrder.status === 'Processing' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                                                            'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                                                        }`}
                                                >
                                                    {updatingStatus === selectedOrder.id ? (
                                                        <RefreshCw size={16} className="animate-spin" />
                                                    ) : (
                                                        `Mark ${nextStatus[selectedOrder.status]}`
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.3);
                }
            `}</style>
        </div>
    );
};

export default ReceiveOrder;
