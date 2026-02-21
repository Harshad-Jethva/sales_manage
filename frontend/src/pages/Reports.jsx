import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchAllData();
    }, []);

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1>Analytics & Reports</h1>
                    <p className="text-muted">Real-time insights and financial tracking.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={fetchAllData}>
                        <RefreshCw size={18} className={loading ? "spin" : ""} /> Refresh
                    </button>
                    <button className="btn-primary" onClick={() => window.print()}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard title="Total Revenue" value={`₹${parseFloat(stats.total_sales || 0).toLocaleString()}`} icon={<DollarSign size={24} />} color="indigo" trend="+12%" />
                <KPICard title="Net Profit" value={`₹${netProfit.toLocaleString()}`} icon={<TrendingUp size={24} />} color="emerald" trend="+8%" />
                <KPICard title="Expenses" value={`₹${parseFloat(stats.total_purchases || 0).toLocaleString()}`} icon={<TrendingDown size={24} />} color="red" trend="-2%" />
                <KPICard title="Outstanding" value={`₹${pendingClients.reduce((sum, c) => sum + parseFloat(c.total_remaining), 0).toLocaleString()}`} icon={<Calendar size={24} />} color="amber" isAlert />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="glass-card chart-card large">
                    <div className="card-header"><h3>Revenue vs Expenses</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card chart-card">
                    <div className="card-header"><h3>Top Products</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Bar dataKey="total_revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pending Payments Section - NEW */}
            <div className="pending-section">
                <div className="section-header">
                    <h2><FileText size={20} /> Client Pending Payments</h2>
                    <div className="search-wrapper">
                        <Search size={16} />
                        <input
                            placeholder="Search client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="glass-card list-container">
                    <div className="list-header">
                        <div className="col name">Client Name</div>
                        <div className="col count">Pending Bills</div>
                        <div className="col total">Total Billed</div>
                        <div className="col paid">Total Paid</div>
                        <div className="col remaining">Remaining Due</div>
                        <div className="col action"></div>
                    </div>

                    <div className="list-body">
                        {filteredPending.map(client => (
                            <div key={client.client_id} className={`list-row-group ${expandedClient === client.client_id ? 'expanded' : ''}`}>
                                <div className="list-row" onClick={() => fetchClientDetails(client.client_id)}>
                                    <div className="col name">
                                        <h4>{client.client_name}</h4>
                                        <span className="sub"><Phone size={12} /> {client.client_phone || 'N/A'}</span>
                                    </div>
                                    <div className="col count"><span className="badge">{client.pending_bills_count} Bills</span></div>
                                    <div className="col total">₹{parseFloat(client.total_billed).toLocaleString()}</div>
                                    <div className="col paid">₹{parseFloat(client.total_paid).toLocaleString()}</div>
                                    <div className="col remaining text-danger">₹{parseFloat(client.total_remaining).toLocaleString()}</div>
                                    <div className="col action">
                                        {expandedClient === client.client_id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedClient === client.client_id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="details-drawer">
                                            <table className="details-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bill #</th>
                                                        <th>Date</th>
                                                        <th>Total Amount</th>
                                                        <th>Paid</th>
                                                        <th>Remaining</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {clientBills.map(bill => (
                                                        <tr key={bill.bill_id}>
                                                            <td>{bill.bill_number}</td>
                                                            <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                                                            <td>₹{parseFloat(bill.total_amount).toLocaleString()}</td>
                                                            <td className="text-success">₹{parseFloat(bill.paid_amount).toLocaleString()}</td>
                                                            <td className="text-danger fw-bold">₹{parseFloat(bill.remaining_amount).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                        {filteredPending.length === 0 && <div className="empty-state">No pending payments found.</div>}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page-container { max-width: 1200px; margin: 0 auto; color: white; padding-bottom: 4rem; }
                .text-muted { color: #94a3b8; margin: 0.5rem 0 0; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .page-header h1 { font-size: 2rem; font-weight: 700; margin: 0; background: linear-gradient(to right, #fff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .header-actions { display: flex; gap: 1rem; }
                .btn-primary, .btn-secondary { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; }
                .btn-primary { background: #6366f1; color: white; }
                .btn-secondary { background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 3rem; }
                .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; padding: 1.5rem; }
                
                /* Pending Section Styles */
                .pending-section { margin-top: 2rem; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-header h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; color: #e2e8f0; }
                .search-wrapper { position: relative; display: flex; align-items: center; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.5rem 1rem; width: 300px; }
                .search-wrapper input { background: none; border: none; color: white; outline: none; margin-left: 0.5rem; width: 100%; }
                .search-wrapper svg { color: #94a3b8; }

                .list-container { padding: 0; }
                .list-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr; padding: 1rem 1.5rem; background: rgba(0,0,0,0.2); font-weight: 600; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
                .list-body { max-height: 500px; overflow-y: auto; }
                .list-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.5fr; padding: 1rem 1.5rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s; }
                .list-row:hover { background: rgba(255,255,255,0.02); }
                
                .col.name h4 { margin: 0; font-size: 1rem; color: #fff; }
                .col.name .sub { font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 0.3rem; margin-top: 2px; }
                .col.remaining { font-weight: 700; color: #f87171; }
                .badge { background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; }
                
                .details-drawer { background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
                .details-table { width: 100%; border-collapse: collapse; }
                .details-table th, .details-table td { padding: 0.8rem 1.5rem; text-align: left; font-size: 0.9rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .details-table th { background: rgba(0,0,0,0.2); font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
                .text-success { color: #4ade80; }
                .fw-bold { font-weight: 700; }
                .empty-state { padding: 2rem; text-align: center; color: #94a3b8; }

                @media (max-width: 1024px) {
                    .charts-grid { grid-template-columns: 1fr; }
                    .list-header, .list-row { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .col:nth-child(n+3) { display: none; } /* Show minimal cols on mobile */
                }
            `}</style>
        </motion.div>
    );
};

// Sub-component for KPI Card (Same as before)
const KPICard = ({ title, value, icon, color, trend, isAlert }) => (
    <div className={`kpi-card glass-card ${isAlert ? 'alert' : ''}`}>
        <div className="kpi-top">
            <div className={`icon-box ${color}`}>{icon}</div>
        </div>
        <div className="kpi-value">
            <h3>{title}</h3>
            <h2>{value}</h2>
        </div>
        <style jsx>{`
            .kpi-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: 0.2s; position: relative; overflow: hidden; }
            .kpi-card:hover { transform: translateY(-4px); }
            .kpi-card.alert { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
            .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; }
            .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .icon-box.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
            .icon-box.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
            .icon-box.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
            .icon-box.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
            .kpi-value h3 { margin: 0; font-size: 0.9rem; color: #94a3b8; font-weight: 500; }
            .kpi-value h2 { margin: 0.4rem 0 0; font-size: 1.75rem; font-weight: 700; color: white; letter-spacing: -0.5px; }
        `}</style>
    </div>
);

export default Reports;
