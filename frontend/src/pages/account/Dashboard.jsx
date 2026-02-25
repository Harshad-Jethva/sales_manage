import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    TrendingUp, Users, Receipt, Wallet, Banknote, Sparkles, Activity, CreditCard
} from 'lucide-react';
import SEO from '../../components/common/SEO';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_sales: 0,
        total_received: 0,
        total_pending: 0,
        bank_balance: 0,
        pending_bills_count: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.dash-anim-el', containerRef.current),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
            );
        }
    }, [isLoading]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/reports.php?type=overall_stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const data = [
        { name: 'Jan', sales: 4000, expenses: 2400 },
        { name: 'Feb', sales: 3000, expenses: 1398 },
        { name: 'Mar', sales: 5000, expenses: 3800 },
        { name: 'Apr', sales: 2780, expenses: 1908 },
        { name: 'May', sales: 1890, expenses: 4800 },
        { name: 'Jun', sales: 2390, expenses: 3800 },
        { name: 'Jul', sales: 3490, expenses: 4300 },
    ];

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="erp-card flex flex-col justify-between dash-anim-el">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-secondary text-sm font-medium mb-1">{title}</h4>
                    <h2 className="text-primary text-2xl font-bold tracking-tight">{value}</h2>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-secondary text-xs">from last month</span>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Dashboard" description="Enterprise Dashboard for viewing key metrics and operations." />
            <header className="page-header dash-anim-el">
                <div>
                    <h1 className="page-title">Enterprise Dashboard</h1>
                    <p className="page-subtitle">Welcome back. Here's your business overview for today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="erp-button erp-button-secondary">
                        <Activity size={16} />
                        Download Report
                    </button>
                    <button className="erp-button erp-button-primary">
                        <TrendingUp size={16} />
                        Generate Insights
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="erp-grid erp-grid-cards mb-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl w-full"></div>)}
                </div>
            ) : (
                <div className="erp-grid erp-grid-cards mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.total_sales?.toLocaleString() || 0}`}
                        icon={TrendingUp}
                        color="#4f46e5"
                        trend={12.5}
                    />
                    <StatCard
                        title="Received Payments"
                        value={`₹${stats.total_received?.toLocaleString() || 0}`}
                        icon={Wallet}
                        color="#10b981"
                        trend={8.2}
                    />
                    <StatCard
                        title="Pending Receivables"
                        value={`₹${stats.total_pending?.toLocaleString() || 0}`}
                        icon={Banknote}
                        color="#f59e0b"
                        trend={-2.4}
                    />
                    <StatCard
                        title="Bank Balance"
                        value={`₹${stats.bank_balance?.toLocaleString() || 0}`}
                        icon={CreditCard}
                        color="#3b82f6"
                        trend={4.1}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Chart */}
                <div className="erp-card lg:col-span-2 dash-anim-el">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
                        <select className="erp-input w-auto py-1 px-3 text-sm">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: AI Insight & Recent Pending */}
                <div className="flex flex-col gap-6">
                    <div className="erp-card relative overflow-hidden dash-anim-el"
                        style={{ background: 'var(--enterprise-gradient)', borderColor: 'rgba(255,255,255,0.15)' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Sparkles size={64} />
                        </div>
                        <h3 className="flex items-center gap-2 mb-2 text-white font-bold text-lg">
                            <Sparkles size={18} className="text-pink-400" />
                            AI Prediction Insight
                        </h3>
                        <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                            Based on your recent transaction velocity, we project a <strong>15% increase</strong> in collections next month if current follow-up rates are maintained.
                        </p>
                        <div className="mt-auto">
                            <p className="text-indigo-300 text-xs uppercase tracking-wider font-semibold mb-1">Forecasted Revenue</p>
                            <h2 className="text-3xl font-black text-white">
                                ₹{((stats.total_sales || 10000) * 1.15).toLocaleString()}
                            </h2>
                        </div>
                    </div>

                    <div className="erp-card flex-1 dash-anim-el">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-white">Pending Invoices</h3>
                            <button className="text-primary text-xs font-semibold hover:underline">View All</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm border border-slate-700">
                                            C{i}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Enterprise Corp {i}</p>
                                            <p className="text-xs text-slate-400">Due in {i * 3} days</p>
                                        </div>
                                    </div>
                                    <span className="text-danger font-bold text-sm">₹{(i * 1500).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="erp-card dash-anim-el">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                    <div className="relative w-64">
                    </div>
                </div>
                <div className="erp-table-container">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Client Name</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-mono text-xs text-slate-300">#TRX-8392</td>
                                <td className="font-medium text-white">Acme Industries</td>
                                <td>Oct 15, 2026</td>
                                <td className="font-semibold text-white">₹24,500.00</td>
                                <td><span className="erp-badge badge-success">Completed</span></td>
                            </tr>
                            <tr>
                                <td className="font-mono text-xs text-slate-300">#TRX-8391</td>
                                <td className="font-medium text-white">Global Tech LLC</td>
                                <td>Oct 14, 2026</td>
                                <td className="font-semibold text-white">₹12,800.00</td>
                                <td><span className="erp-badge badge-warning">Pending</span></td>
                            </tr>
                            <tr>
                                <td className="font-mono text-xs text-slate-300">#TRX-8390</td>
                                <td className="font-medium text-white">Stark Enterprises</td>
                                <td>Oct 12, 2026</td>
                                <td className="font-semibold text-white">₹85,000.00</td>
                                <td><span className="erp-badge badge-success">Completed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
