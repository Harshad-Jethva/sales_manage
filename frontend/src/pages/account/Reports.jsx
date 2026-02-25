import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag,
    Calendar, Download, RefreshCw, ArrowUpRight, ArrowDownRight,
    Search, ChevronDown, ChevronUp, FileText, Phone
} from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const Reports = () => {
    const [stats, setStats] = useState({});
    const [monthlyData, setMonthlyData] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pending Payments State
    const [pendingClients, setPendingClients] = useState([]);
    const [expandedClient, setExpandedClient] = useState(null);
    const [clientBills, setClientBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.report-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [loading, searchTerm]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsRes, monthlyRes, clientsRes, productsRes, pendingRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/reports.php?type=overall_stats'),
                axios.get('http://localhost/sales_manage/backend/api/reports.php?type=monthly_trend'),
                axios.get('http://localhost/sales_manage/backend/api/reports.php?type=top_clients'),
                axios.get('http://localhost/sales_manage/backend/api/reports.php?type=top_products'),
                axios.get('http://localhost/sales_manage/backend/api/reports.php?type=pending_payments')
            ]);

            setStats(statsRes.data || {});
            setMonthlyData(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
            setTopClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
            setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setPendingClients(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientDetails = async (clientId) => {
        if (expandedClient === clientId) {
            setExpandedClient(null);
            return;
        }
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/reports.php?type=client_pending_details&client_id=${clientId}`);
            setClientBills(res.data);
            setExpandedClient(clientId);
        } catch (err) {
            console.error(err);
        }
    };

    const netProfit = (stats.total_sales || 0) - (stats.total_purchases || 0);

    const filteredPending = pendingClients.filter(c =>
        c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.client_phone && c.client_phone.includes(searchTerm))
    );

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Analytics & Reports" description="Real-time insights and financial tracking." />
            {/* Header */}
            <header className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 report-anim-el">
                <div>
                    <h1 className="page-title">Analytics & Reports</h1>
                    <p className="page-subtitle">Real-time insights and financial tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="erp-button erp-button-secondary bg-surface-hover border-[rgba(255,255,255,0.05)]" onClick={fetchAllData}>
                        <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} /> <span>Refresh</span>
                    </button>
                    <button className="erp-button erp-button-primary shadow-lg" onClick={() => window.print()}>
                        <Download size={18} /> <span>Export Report</span>
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="erp-grid erp-grid-cards mb-8">
                <KPICard title="Total Revenue" value={`₹${parseFloat(stats.total_sales || 0).toLocaleString()}`} icon={<DollarSign size={24} />} color="indigo" />
                <KPICard title="Net Profit" value={`₹${netProfit.toLocaleString()}`} icon={<TrendingUp size={24} />} color="emerald" />
                <KPICard title="Total Expenses" value={`₹${parseFloat(stats.total_purchases || 0).toLocaleString()}`} icon={<TrendingDown size={24} />} color="red" />
                <KPICard title="Outstanding Dues" value={`₹${pendingClients.reduce((sum, c) => sum + parseFloat(c.total_remaining), 0).toLocaleString()}`} icon={<Calendar size={24} />} color="amber" isAlert />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 report-anim-el">
                <div className="erp-card lg:col-span-2">
                    <div className="p-5 border-b border-[rgba(255,255,255,0.05)] bg-surface-hover">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" /> Revenue vs Expenses
                        </h3>
                    </div>
                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#e2e8f0' }} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="erp-card">
                    <div className="p-5 border-b border-[rgba(255,255,255,0.05)] bg-surface-hover">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShoppingBag size={20} className="text-emerald-400" /> Top Products
                        </h3>
                    </div>
                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} stroke="#cbd5e1" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                <Bar dataKey="total_revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pending Payments Section */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 report-anim-el">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={20} className="text-amber-400" /> Client Pending Payments
                </h2>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search client by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="erp-input pl-10 w-full"
                    />
                </div>
            </div>

            <div className="erp-card overflow-hidden report-anim-el">
                <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-[rgba(255,255,255,0.05)] bg-surface-hover/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2">Client Details</div>
                    <div>Bills</div>
                    <div className="text-right">Total Billed</div>
                    <div className="text-right">Total Paid</div>
                    <div className="text-right">Remaining Due</div>
                </div>

                <div className="divide-y divide-[rgba(255,255,255,0.05)] max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-4 flex gap-4">
                                <div className="skeleton h-10 w-full rounded"></div>
                            </div>
                        ))
                    ) : filteredPending.length > 0 ? (
                        filteredPending.map(client => (
                            <div key={client.client_id} className="group">
                                <div
                                    className={`md:grid md:grid-cols-6 flex flex-col gap-4 p-4 cursor-pointer hover:bg-surface-hover/50 transition-colors items-center ${expandedClient === client.client_id ? 'bg-indigo-500/5' : ''}`}
                                    onClick={() => fetchClientDetails(client.client_id)}
                                >
                                    <div className="col-span-2 w-full flex items-center justify-between md:justify-start gap-3">
                                        <div>
                                            <h4 className="text-white font-bold group-hover:text-indigo-300 transition-colors">{client.client_name}</h4>
                                            <div className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Phone size={12} /> {client.client_phone || 'No phone'}
                                            </div>
                                        </div>
                                        <div className="md:hidden">
                                            {expandedClient === client.client_id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block">
                                        <span className="md:hidden text-slate-400 text-sm">Bills:</span>
                                        <span className="erp-badge badge-warning opacity-80">{client.pending_bills_count} Pending</span>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block text-right">
                                        <span className="md:hidden text-slate-400 text-sm">Total Billed:</span>
                                        <span className="text-slate-300">₹{parseFloat(client.total_billed).toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:block text-right">
                                        <span className="md:hidden text-slate-400 text-sm">Total Paid:</span>
                                        <span className="text-emerald-400">₹{parseFloat(client.total_paid).toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-between md:flex md:items-center md:justify-end gap-3 text-right">
                                        <span className="md:hidden text-slate-400 text-sm">Remaining:</span>
                                        <span className="text-red-400 font-bold font-mono text-lg">₹{parseFloat(client.total_remaining).toLocaleString('en-IN')}</span>
                                        <div className="hidden md:block">
                                            {expandedClient === client.client_id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedClient === client.client_id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-black/20"
                                        >
                                            <div className="p-4 border-t border-[rgba(255,255,255,0.02)]">
                                                <div className="erp-table-container shadow-inner">
                                                    <table className="erp-table text-sm">
                                                        <thead className="bg-surface-hover/30">
                                                            <tr>
                                                                <th>Bill No.</th>
                                                                <th>Date</th>
                                                                <th className="text-right">Bill Total</th>
                                                                <th className="text-right">Amount Paid</th>
                                                                <th className="text-right text-red-400">Balance Due</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {clientBills.map(bill => (
                                                                <tr key={bill.bill_id} className="hover:bg-white/5">
                                                                    <td className="font-mono text-indigo-300">{bill.bill_number}</td>
                                                                    <td className="text-slate-400">{new Date(bill.bill_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                                    <td className="text-right text-slate-300">₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}</td>
                                                                    <td className="text-right text-emerald-400">₹{parseFloat(bill.paid_amount).toLocaleString('en-IN')}</td>
                                                                    <td className="text-right font-bold text-red-400 font-mono bg-red-500/5">₹{parseFloat(bill.remaining_amount).toLocaleString('en-IN')}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No pending payments found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component for KPI Card
const KPICard = ({ title, value, icon, color, isAlert }) => {
    const colorClasses = {
        indigo: "bg-indigo-500/10 text-indigo-400",
        emerald: "bg-emerald-500/10 text-emerald-400",
        red: "bg-red-500/10 text-red-400",
        amber: "bg-amber-500/10 text-amber-500"
    };

    return (
        <div className={`erp-card p-6 flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${isAlert ? 'border-l-4 border-amber-500/50 bg-amber-500/5' : ''}`}>
            {isAlert && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/20 to-transparent blur-xl rounded-full -mr-8 -mt-8"></div>}

            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {icon}
            </div>
            <div>
                <h3 className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</h3>
                <h2 className="text-white text-3xl font-bold font-mono tracking-tight">{value}</h2>
            </div>
        </div>
    );
};

export default Reports;
