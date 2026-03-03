import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    Building2,
    Phone,
    Mail,
    FileText,
    Eye,
    Download,
    Printer,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Filter,
    Clock,
    CheckCircle,
    Truck,
    ArrowRight,
    Calendar,
    CalendarDays
} from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const ClientOrderHistory = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        start_date: '',
        end_date: '',
        page: 1,
        limit: 5
    });

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetchClients();
        }
    }, [searchQuery]);

    useEffect(() => {
        if (selectedClient) {
            fetchClientHistory(selectedClient.id);
        }
    }, [filters, selectedClient]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/clients.php?search=${searchQuery}`);
            if (response.data.success) {
                setClients(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchClientHistory = async (clientId) => {
        setOrdersLoading(true);
        try {
            const { status, start_date, end_date, page, limit } = filters;
            const params = new URLSearchParams({
                client_id: clientId,
                status,
                start_date,
                end_date,
                page,
                limit
            });
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/orders.php?${params.toString()}`);
            if (response.data.success) {
                setOrderHistory(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        setSearchQuery('');
        setClients([]);
        setShowClientSearch(false);
        setFilters({ status: '', start_date: '', end_date: '', page: 1, limit: 5 });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'text-emerald-500 bg-emerald-500/10';
            case 'Delivered': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-amber-500 bg-amber-500/10';
        }
    };

    return (
        <div className="client-history p-4 lg:p-8">
            <Helmet>
                <title>Client Order History | HAB CREATION</title>
            </Helmet>

            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white">Client Order History</h1>
                <p className="text-gray-400 mt-1">Search for a client to view their complete transaction and bill history.</p>
            </div>

            {/* Client Search Section */}
            <div className="max-w-3xl mx-auto mb-12">
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400">
                        <Search size={24} />
                    </span>
                    <input
                        type="text"
                        placeholder="Enter client name, company, or phone number..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-2xl"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowClientSearch(true);
                        }}
                        onFocus={() => setShowClientSearch(true)}
                    />

                    <AnimatePresence>
                        {showClientSearch && clients.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-4 bg-[#121826] border border-white/10 rounded-2xl shadow-3xl z-50 overflow-hidden"
                            >
                                {clients.map(client => (
                                    <div
                                        key={client.id}
                                        className="p-6 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between group"
                                        onClick={() => selectClient(client)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">{client.name}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1"><Building2 size={14} /> {client.company || 'Retail'}</span>
                                                    <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {selectedClient ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Client Profile Card */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl sticky top-8"
                        >
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-indigo-500/20">
                                    {selectedClient.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                                <p className="text-indigo-400 font-medium">{selectedClient.company || 'Private Client'}</p>
                                <div className="mt-4 px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                                    Active Member
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="p-2 rounded-lg bg-white/5"><Phone size={18} className="text-indigo-400" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Phone</p>
                                        <p>{selectedClient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="p-2 rounded-lg bg-white/5"><Mail size={18} className="text-indigo-400" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email</p>
                                        <p className="truncate w-42">{selectedClient.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="p-2 rounded-lg bg-white/5"><FileText size={18} className="text-indigo-400" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Orders</p>
                                        <p className="text-xl font-bold text-white">{orderHistory.length}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2">
                                <FileText size={18} /> Edit Profile
                            </button>
                        </motion.div>
                    </div>

                    {/* Transaction History Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Full Transaction History</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400" title="Export to Excel">
                                        <Download size={18} />
                                    </button>
                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400" title="Print statement">
                                        <Printer size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-b border-white/10 bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="group space-y-1.5">
                                        <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-1.5">
                                            <Filter size={12} /> Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 appearance-none transition-all cursor-pointer hover:bg-black/60"
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group space-y-1.5">
                                        <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-1.5">
                                            <CalendarDays size={12} /> From Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all hover:bg-black/60"
                                            value={filters.start_date}
                                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div className="group space-y-1.5">
                                        <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest flex items-center gap-1.5">
                                            <CalendarDays size={12} /> To Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all hover:bg-black/60"
                                            value={filters.end_date}
                                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end pb-0.5">
                                        <button
                                            onClick={() => setFilters({ ...filters, status: '', start_date: '', end_date: '', page: 1 })}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-all border border-white/10"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {ordersLoading ? (
                                <div className="p-20 text-center">
                                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading history...</p>
                                </div>
                            ) : orderHistory.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {orderHistory.map((order) => (
                                        <div key={order.id} className="p-8 hover:bg-white/5 transition-all group">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${getStatusColor(order.status)}`}>
                                                        {order.status === 'Confirmed' ? <CheckCircle size={24} /> : order.status === 'Delivered' ? <Truck size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Order #{order.order_number}</h4>
                                                            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${getStatusColor(order.status).replace('bg-', 'border-')}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                            <Calendar size={14} /> {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-white">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                                                    <p className="text-emerald-500 text-xs font-bold">Paid</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex -space-x-2">
                                                    <div className="w-8 h-8 rounded-full border-2 border-[#121826] bg-indigo-500/20 flex items-center justify-center text-[10px] text-white">IT</div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-[#121826] bg-purple-500/20 flex items-center justify-center text-[10px] text-white">MS</div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-[#121826] bg-white/5 text-[10px] text-gray-400 flex items-center justify-center">+2</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => navigate('/salesman/order-history')}
                                                        className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-sm font-bold transition-all flex items-center gap-2"
                                                    >
                                                        <Eye size={16} /> View Bill
                                                    </button>
                                                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold transition-all">
                                                        <Printer size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <div className="p-6 rounded-full bg-white/5 text-gray-600">
                                        <FileText size={60} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">No Orders Found</h4>
                                        <p className="text-gray-500 max-w-xs mx-auto mt-2">This client hasn't placed any orders yet or doesn't have any purchase history.</p>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="p-6 flex items-center justify-between border-t border-white/10 bg-black/20">
                                <p className="text-sm font-medium text-gray-400">
                                    Page <span className="text-white font-bold">{filters.page}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={filters.page === 1}
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        className="px-4 py-2 bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-30 disabled:hover:bg-black/40 transition-all flex items-center gap-2 text-sm font-bold"
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <button
                                        disabled={orderHistory.length < filters.limit}
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 rounded-xl text-white disabled:opacity-30 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2 text-sm font-bold"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <Search size={80} className="mx-auto text-white/5 mb-6" />
                    <h3 className="text-white text-xl font-bold font-heading">Start by searching a client</h3>
                    <p className="text-gray-500 mt-2">Enter keywords in the search bar above to see billing records.</p>
                </div>
            )}
        </div>
    );
};

export default ClientOrderHistory;
