import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, FileText, Phone, MapPin, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientBills = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtering and Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/clients.php');
            setCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm)) ||
            (c.shop_name && c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchFilter = filterType === 'All' || c.customer_type === filterType;
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const currentCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (val) => `\u20B9${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <header className="page-header flex flex-col items-start gap-4 mb-6">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <FileText className="text-indigo-400" size={32} /> Client Bills Management
                    </h1>
                    <p className="page-subtitle mt-1">Search and select a client to view their profile, outstanding balance, and complete billing history.</p>
                </div>
            </header>

            <div className="erp-card p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 border border-[rgba(255,255,255,0.05)] shadow-lg items-center justify-between z-10 relative">
                <div className="relative w-full md:w-1/2 lg:w-1/3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="erp-input pl-12 w-full"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="relative w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="text-slate-500" size={18} />
                    </div>
                    <select
                        className="erp-input pl-10 w-full md:w-auto min-w-[160px] appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.8rem_center] bg-no-repeat pr-10"
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All" className="bg-slate-800">All Types</option>
                        <option value="Regular" className="bg-slate-800">Regular</option>
                        <option value="VIP" className="bg-slate-800">VIP</option>
                        <option value="Wholesale" className="bg-slate-800">Wholesale</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 font-medium tracking-wide animate-pulse">Loading clients...</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {currentCustomers.map((client, index) => {
                                const outstanding = parseFloat(client.remaining_payment ?? client.outstanding ?? 0);
                                return (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate('/clients/view', { state: { client } })}
                                        className="erp-card p-6 cursor-pointer group hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all scale-50 group-hover:scale-100 duration-300">
                                            <Eye size={20} />
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <h3 className="font-bold text-white text-lg truncate leading-tight group-hover:text-indigo-300 transition-colors">
                                                    {client.name}
                                                </h3>
                                                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                                                    {client.customer_type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            {client.shop_name && (
                                                <div className="font-bold text-white text-sm truncate">{client.shop_name}</div>
                                            )}
                                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                                <Phone size={14} className="text-slate-500" /> <span className="truncate">{client.phone}</span>
                                            </div>
                                            {client.city && (
                                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                                    <MapPin size={14} className="text-slate-500" /> <span className="truncate">{client.city}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between items-end">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">Outstanding</div>
                                                <div className={`text-xl font-black tracking-tight ${outstanding > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {formatCurrency(outstanding)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-bold text-indigo-400 group-hover:text-white transition-colors">
                                                History <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {currentCustomers.length === 0 && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                <FileText size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No clients found</h3>
                            <p>We couldn't find any clients matching your criteria.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-6 pb-6 mt-auto">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface border border-[rgba(255,255,255,0.05)] text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-indigo-400 shadow-lg"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="font-bold text-slate-400 flex items-center gap-2">
                                <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 text-indigo-300 rounded-lg">{currentPage}</span>
                                <span>/</span>
                                <span>{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface border border-[rgba(255,255,255,0.05)] text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-indigo-400 shadow-lg"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientBills;
