import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Calendar, Receipt, FileText, IndianRupee, CreditCard, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';

const AllBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, partial, paid
    const [methodFilter, setMethodFilter] = useState('all'); // all, Cash, Online, Card, etc.
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost/sales_manage/backend/api/bills.php');
            const data = Array.isArray(response.data) ? response.data : [];
            // Assuming POS only cares about sales
            const salesBills = data.filter(b => b.bill_type === 'sale');
            setBills(salesBills);
        } catch (err) {
            console.error("Error fetching bills:", err);
        } finally {
            setLoading(false);
        }
    };

    // Derived unique payment methods for the filter dropdown
    const availablePaymentMethods = [...new Set(bills.map(b => b.payment_method).filter(Boolean))];

    const filteredBills = bills.filter(bill => {
        // Search term filter
        const matchesSearch =
            (bill.bill_number && bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (bill.customer_name && bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (bill.customer_id && bill.customer_id.toString().includes(searchTerm)) ||
            (bill.client_id && bill.client_id.toString().includes(searchTerm));

        // Status filter
        const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;

        // Payment method filter
        const matchesMethod = methodFilter === 'all' || (bill.payment_method && bill.payment_method.toLowerCase() === methodFilter.toLowerCase());

        // Date filter
        const billDate = new Date(bill.bill_date);
        let matchesDate = true;
        if (dateFrom) {
            matchesDate = matchesDate && billDate >= new Date(dateFrom);
        }
        if (dateTo) {
            matchesDate = matchesDate && billDate <= new Date(dateTo);
        }

        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });

    // Stats
    const totalAmount = filteredBills.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0);
    const totalPaid = filteredBills.reduce((acc, curr) => acc + parseFloat(curr.paid_amount || 0), 0);
    const totalPending = filteredBills.reduce((acc, curr) => {
        const total = parseFloat(curr.total_amount || 0);
        const paid = parseFloat(curr.paid_amount || 0);
        return acc + Math.max(0, total - paid);
    }, 0);

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'partial': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle size={14} className="mr-1" />;
            case 'partial': return <Clock size={14} className="mr-1" />;
            case 'pending': return <Clock size={14} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] text-gray-200 p-6 animate-fade-in pb-24">
            <SEO title="All Bills | POS" description="View and filter all bills and invoices." />

            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">All Bills Report</h1>
                <p className="text-gray-400 mt-1">Track and filter all transactions seamlessly.</p>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Total Overview</p>
                        <h3 className="text-2xl font-bold text-gray-100 font-mono">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                        <IndianRupee size={24} />
                    </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-500/70 text-sm font-medium mb-1">Total Collected</p>
                        <h3 className="text-2xl font-bold text-emerald-400 font-mono">₹{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-amber-500/70 text-sm font-medium mb-1">Total Outstanding</p>
                        <h3 className="text-2xl font-bold text-amber-400 font-mono">₹{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-8 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Bill No, Client Name, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="w-full md:w-48">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Method Dropdown */}
                    <div className="w-full md:w-48">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Payment Mode</label>
                        <div className="relative">
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                            >
                                <option value="all">All Modes</option>
                                {availablePaymentMethods.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Date Filters Toggle */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`h-[46px] px-4 rounded-lg border flex items-center gap-2 transition-colors ${isFilterOpen || dateFrom || dateTo
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                                }`}
                        >
                            <Calendar size={18} />
                            <span className="hidden md:inline">Dates</span>
                        </button>
                    </div>
                </div>

                {/* Expanded Date Filters */}
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, mt: 0 }}
                        animate={{ height: 'auto', opacity: 1, mt: 16 }}
                        className="flex gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                    >
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Bills Table */}
            <div className="max-w-7xl mx-auto bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-gray-700/50">Bill Info</th>
                                <th className="p-4 font-medium border-b border-gray-700/50">Client</th>
                                <th className="p-4 font-medium border-b border-gray-700/50">Date</th>
                                <th className="p-4 font-medium border-b border-gray-700/50">Amount</th>
                                <th className="p-4 font-medium border-b border-gray-700/50">Status</th>
                                <th className="p-4 font-medium border-b border-gray-700/50">Mode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-400">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        Loading bills...
                                    </td>
                                </tr>
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        <Receipt size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="text-lg">No bills found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map((bill, i) => {
                                    const total = parseFloat(bill.total_amount || 0);
                                    const paid = parseFloat(bill.paid_amount || 0);
                                    const pending = Math.max(0, total - paid);

                                    return (
                                        <motion.tr
                                            key={bill.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02, ease: "easeOut" }}
                                            className="hover:bg-gray-700/20 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-700 flex flex-col items-center justify-center text-xs text-gray-500 group-hover:border-indigo-500/50 transition-colors">
                                                        <FileText size={14} className="mb-0.5 text-gray-400" />
                                                        #{bill.id}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-200">{bill.bill_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {bill.customer_name ? (
                                                    <div>
                                                        <p className="font-medium text-gray-200">{bill.customer_name}</p>
                                                        {bill.customer_id && <p className="text-xs text-gray-500">ID: {bill.customer_id.toString().padStart(3, '0')}</p>}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">Walk-in Customer</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {new Date(bill.bill_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-gray-100 mb-1">₹{total.toLocaleString()}</div>
                                                {pending > 0 && (
                                                    <div className="text-xs text-amber-500/80">Pending: ₹{pending.toLocaleString()}</div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                                                    {getStatusIcon(bill.status)}
                                                    {bill.status ? bill.status.charAt(0).toUpperCase() + bill.status.slice(1) : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                    {bill.payment_method?.toLowerCase() === 'cash' ? <IndianRupee size={14} className="text-gray-500" /> : <CreditCard size={14} className="text-gray-500" />}
                                                    {bill.payment_method || 'N/A'}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllBills;
