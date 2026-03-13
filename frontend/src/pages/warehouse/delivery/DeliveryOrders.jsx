import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Package, Truck, Calendar, Search, Filter, Edit, Eye, 
    MoreVertical, ArrowRight, CheckCircle, Clock, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/common/SEO';
import gsap from 'gsap';

const DeliveryOrders = () => {
    const [orders, setOrders] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Modals
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    
    const [formData, setFormData] = useState({
        order_id: '',
        client_id: '',
        delivery_person_id: '',
        assigned_date: '',
        delivery_priority: 'Normal',
        delivery_status: 'Pending'
    });

    const containerRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".order-row-anim",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [loading, filterStatus, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, staffRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/delivery/orders.php?action=list'),
                axios.get('http://localhost/sales_manage/backend/api/delivery/staff.php?action=list')
            ]);
            
            if (ordersRes.data.success) {
                setOrders(ordersRes.data.data);
            } else {
                toast.error('Failed to fetch delivery orders');
            }

            if (staffRes.data.success) {
                // Only active staff
                const activeStaff = staffRes.data.data.filter(s => s.status === 'Active');
                setStaff(activeStaff);
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = (order) => {
        setSelectedOrder(order);
        setFormData({
            order_id: order.order_id,
            client_id: order.client_id,
            delivery_person_id: order.delivery_person_id || '',
            assigned_date: order.assigned_date || new Date().toISOString().split('T')[0],
            delivery_priority: order.delivery_priority || 'Normal',
            delivery_status: order.delivery_status || 'Pending'
        });
        setIsAssignModalOpen(true);
    };

    const handleViewClick = async (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
        setOrderItems([]);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/delivery/orders.php?action=items&order_id=${order.order_id}`);
            if (res.data.success) setOrderItems(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load items");
        }
    };

    const handleSubmitAssign = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Assigning delivery...');
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/delivery/orders.php?action=assign', formData);
            if (res.data.success) {
                toast.success(res.data.message, { id: loadingToast });
                setIsAssignModalOpen(false);
                fetchData();
            } else {
                toast.error(res.data.error || 'Assignment failed', { id: loadingToast });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Assignment failed', { id: loadingToast });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Out for Delivery': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Failed Delivery': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400';
            case 'Urgent': return 'text-rose-500 font-bold animate-pulse';
            case 'Low': return 'text-slate-400';
            default: return 'text-emerald-400';
        }
    };

    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            (o.order_number && o.order_number.toLowerCase().includes(term)) ||
            (o.client_name && o.client_name.toLowerCase().includes(term)) ||
            (o.delivery_person_name && o.delivery_person_name.toLowerCase().includes(term));
            
        const oStatus = o.delivery_status || 'Unassigned';
        const matchesStatus = filterStatus === 'All' ? true : oStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="delivery-orders-container" ref={containerRef}>
            <SEO title="Delivery Orders | Warehouse" description="Assign and manage delivery orders." />

            <div className="page-header mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                            <Package size={32} />
                        </div>
                        Delivery Order Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage orders fetched from Salesman Order System, assign delivery staff and track priority.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Client Name, Staff..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all backdrop-blur-sm min-w-[180px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Unassigned">Unassigned</option>
                            <option value="Pending">Pending Assignment</option>
                            <option value="Accepted">Accepted by Staff</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Failed Delivery">Failed Delivery</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-700/50">
                                <th className="p-4 font-semibold w-16">Order ID</th>
                                <th className="p-4 font-semibold w-48">Client Details</th>
                                <th className="p-4 font-semibold w-32">Items / Amount</th>
                                <th className="p-4 font-semibold w-32">Date / Priority</th>
                                <th className="p-4 font-semibold w-48">Delivery Assigned To</th>
                                <th className="p-4 font-semibold w-32 text-center">Status</th>
                                <th className="p-4 font-semibold w-24 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-700/50 animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-700/50 rounded w-12"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div><div className="h-3 bg-slate-700/30 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-700/50 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-700/50 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-8 bg-slate-700/50 rounded-lg w-full"></div></td>
                                        <td className="p-4"><div className="h-6 bg-slate-700/50 rounded-full w-20 mx-auto"></div></td>
                                        <td className="p-4"><div className="h-8 bg-slate-700/50 rounded-lg w-16 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.order_id} className="order-row-anim border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-indigo-400 font-bold">#{order.order_number || order.order_id}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white font-medium truncate max-w-[200px]" title={order.client_name}>{order.client_name}</div>
                                            <div className="text-slate-500 text-xs truncate max-w-[200px]" title={order.client_address}>{order.client_address || 'No Address'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white">{order.item_count} Items</div>
                                            <div className="text-emerald-400 font-bold font-mono text-sm">₹{parseFloat(order.total_amount).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-300 text-sm flex items-center gap-1"><Calendar size={12}/> {order.order_date}</div>
                                            <div className={`text-xs mt-1 font-semibold flex items-center gap-1 ${getPriorityStyle(order.delivery_priority)}`}>
                                                <AlertTriangle size={12}/> {order.delivery_priority || 'Normal'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {order.delivery_person_id ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-500/30">
                                                        {order.delivery_person_name?.charAt(0) || 'D'}
                                                    </div>
                                                    <div>
                                                        <div className="text-white text-sm font-medium">{order.delivery_person_name}</div>
                                                        <div className="text-slate-500 text-xs">Due: {order.assigned_date}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-500 text-sm italic">Not Assigned</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {order.delivery_person_id ? (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.delivery_status)}`}>
                                                    {order.delivery_status}
                                                </span>
                                            ) : (
                                                <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewClick(order)}
                                                    className="p-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/50"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleAssignClick(order)}
                                                    className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/30 rounded-lg transition-colors border border-indigo-500/30"
                                                    title="Assign / Update Delivery"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package size={48} className="text-slate-600 mb-4" />
                                            <p className="text-lg text-slate-300">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsAssignModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-3xl shadow-2xl z-20 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                <h2 className="text-xl font-bold text-white flex gap-2 items-center">
                                    <Truck className="text-indigo-400"/>
                                    Assign Delivery Person
                                </h2>
                                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmitAssign} className="p-6 space-y-5">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <div className="text-sm text-slate-400 mb-1">Order Details</div>
                                    <div className="text-white font-bold flex justify-between">
                                        <span>Order #{selectedOrder?.order_number || selectedOrder?.order_id}</span>
                                        <span>Client: {selectedOrder?.client_name}</span>
                                    </div>
                                    <div className="text-slate-500 text-xs mt-1 truncate">{selectedOrder?.client_address}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Delivery Staff</label>
                                    <select 
                                        name="delivery_person_id" required 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" 
                                        value={formData.delivery_person_id} 
                                        onChange={e => setFormData({...formData, delivery_person_id: e.target.value})}
                                    >
                                        <option value="">-- Choose Staff --</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.mobile})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Date</label>
                                        <input 
                                            type="date" required 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 transition-all outline-none" 
                                            value={formData.assigned_date} 
                                            onChange={e => setFormData({...formData, assigned_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 transition-all outline-none"
                                            value={formData.delivery_priority} 
                                            onChange={e => setFormData({...formData, delivery_priority: e.target.value})}
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Status</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 transition-all outline-none"
                                        value={formData.delivery_status} 
                                        onChange={e => setFormData({...formData, delivery_status: e.target.value})}
                                    >
                                        <option value="Pending">Pending Assignment</option>
                                        <option value="Accepted">Accepted by Staff</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Failed Delivery">Failed Delivery</option>
                                    </select>
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition">Cancel</button>
                                    <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition">
                                        Save Assignment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {isViewModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsViewModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-3xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Order Details #{selectedOrder?.order_number || selectedOrder?.order_id}</h2>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getStatusStyle(selectedOrder?.delivery_status || 'Unassigned')}`}>
                                        {selectedOrder?.delivery_status || 'Unassigned'}
                                    </span>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="w-10 h-10 bg-slate-800 text-slate-400 hover:text-white rounded-full flex justify-center items-center transition border border-slate-700/50"><X size={20} /></button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl">
                                        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex gap-2 items-center"><Package size={14}/> Client Information</h4>
                                        <p className="text-white font-bold text-lg">{selectedOrder?.client_name}</p>
                                        <p className="text-slate-400 text-sm mt-1">{selectedOrder?.client_address || 'No address provided'}</p>
                                    </div>
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-2xl">
                                        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex gap-2 items-center"><Truck size={14}/> Delivery Staff</h4>
                                        {selectedOrder?.delivery_person_id ? (
                                            <>
                                                <p className="text-white font-bold text-lg">{selectedOrder?.delivery_person_name}</p>
                                                <p className="text-slate-400 text-sm mt-1"><Clock size={12} className="inline mr-1"/>Assigned: {selectedOrder?.assigned_date}</p>
                                                <p className={`text-sm mt-1 font-semibold ${getPriorityStyle(selectedOrder?.delivery_priority)}`}>
                                                    Priority: {selectedOrder?.delivery_priority}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-slate-500 italic mt-2">No delivery staff assigned.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-white font-bold text-lg mb-3">Order Items</h4>
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-800">
                                                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                                    <th className="p-3">Item</th>
                                                    <th className="p-3 text-center">Qty</th>
                                                    <th className="p-3 text-right">Price</th>
                                                    <th className="p-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.length > 0 ? orderItems.map((item, idx) => (
                                                    <tr key={idx} className="border-t border-slate-700/50 text-white text-sm hover:bg-slate-700/30">
                                                        <td className="p-3">{item.product_name || `Item #${item.product_id}`}</td>
                                                        <td className="p-3 text-center">{item.quantity}</td>
                                                        <td className="p-3 text-right font-mono text-slate-300">₹{parseFloat(item.price).toLocaleString()}</td>
                                                        <td className="p-3 text-right font-mono text-emerald-400 font-bold">₹{parseFloat(item.total).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="p-4 text-center text-slate-500 italic">No items found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 px-2">
                                        <span className="text-slate-400 font-semibold uppercase tracking-wider">Total Amount</span>
                                        <span className="text-2xl font-black text-white font-mono">₹{parseFloat(selectedOrder?.total_amount || 0).toLocaleString()}</span>
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

export default DeliveryOrders;
