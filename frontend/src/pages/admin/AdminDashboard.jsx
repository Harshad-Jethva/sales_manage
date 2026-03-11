import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    Shield, TrendingUp, Users, Receipt, Wallet, Banknote, Sparkles, Activity, CreditCard, Box, Truck
} from 'lucide-react';
import SEO from '../../components/common/SEO';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_sales: 0,
        total_received: 0,
        total_pending: 0,
        bank_balance: 0,
        pending_bills_count: 0
    });
    const [expiryAnalytics, setExpiryAnalytics] = useState({
        expired: 0,
        soon: 0
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

            // Trigger Expiry Alerts Check
            await axios.get('http://localhost/sales_manage/backend/api/expiry.php?action=check_alerts');

            // Fetch Expiry Counts for UI
            const expRes = await axios.get('http://localhost/sales_manage/backend/api/expiry.php?action=list');
            if (expRes.data.success) {
                const list = expRes.data.data || [];
                setExpiryAnalytics({
                    expired: list.filter(i => parseInt(i.remaining_days) <= 0).length,
                    soon: list.filter(i => parseInt(i.remaining_days) > 0 && parseInt(i.remaining_days) <= 30).length
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const data = [
        { name: 'Jan', revenue: 45000, margin: 24000 },
        { name: 'Feb', revenue: 52000, margin: 28000 },
        { name: 'Mar', revenue: 38000, margin: 19000 },
        { name: 'Apr', revenue: 65000, margin: 34000 },
        { name: 'May', revenue: 48000, margin: 26000 },
        { name: 'Jun', revenue: 71000, margin: 41000 },
        { name: 'Jul', revenue: 84000, margin: 48000 },
    ];

    const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
        <div className="erp-card flex flex-col justify-between dash-anim-el" style={{ borderTop: `4px solid ${color}` }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-secondary text-sm font-medium mb-1">{title}</h4>
                    <h2 className="text-white text-2xl font-bold tracking-tight">{value}</h2>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-secondary text-xs">{subtitle || 'from last month'}</span>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" ref={containerRef}>
            <SEO title="Admin Master Dashboard" description="Master Control Panel for the Enterprise." />

            <header className="page-header dash-anim-el">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="page-title text-3xl">Master Control Panel</h1>
                        <p className="page-subtitle text-indigo-200/60 mt-1">Super Admin Overview bridging Accounts, POS, Sales, and Warehouse.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="erp-button erp-button-secondary">
                        <Activity size={16} />
                        System Logs
                    </button>
                    <button className="erp-button erp-button-primary shadow-lg shadow-indigo-500/30">
                        <Sparkles size={16} />
                        Master Report
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
                        title="Enterprise Revenue"
                        value={`₹${stats.total_sales?.toLocaleString() || 0}`}
                        icon={TrendingUp}
                        color="#4f46e5"
                        trend={14.2}
                    />
                    <StatCard
                        title="Global Receipts"
                        value={`₹${stats.total_received?.toLocaleString() || 0}`}
                        icon={Wallet}
                        color="#10b981"
                        trend={6.8}
                    />
                    <StatCard
                        title="Active Salesmen"
                        value="12"
                        icon={Users}
                        color="#f59e0b"
                        trend={2}
                        subtitle="new joins this month"
                    />
                    <StatCard
                        title="Warehouse Deliveries"
                        value="324"
                        icon={Truck}
                        color="#3b82f6"
                        trend={8.5}
                        subtitle="packages shipped"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Master Chart */}
                <div className="erp-card lg:col-span-2 dash-anim-el">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="text-indigo-400" size={18} />
                            Enterprise Performance Matrix
                        </h3>
                        <select className="erp-input w-auto py-1 px-3 text-sm bg-slate-800/50">
                            <option>YTD Overview</option>
                            <option>Last Quarter</option>
                        </select>
                    </div>
                    <div style={{ height: '340px', minHeight: '340px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} fill="url(#colorMargin)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Status Summary */}
                <div className="flex flex-col gap-6">
                    <div className="erp-card relative overflow-hidden dash-anim-el"
                        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 blur-[2px]">
                            <Shield size={100} />
                        </div>
                        <h3 className="flex items-center gap-2 mb-4 text-white font-bold text-lg">
                            <Shield size={18} className="text-indigo-400" />
                            System Health
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Account Sync</span>
                                    <span className="text-success font-medium">100%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-success h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">POS Terminals Online</span>
                                    <span className="text-emerald-400 font-medium">8/8</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Warehouse Fulfillment</span>
                                    <span className="text-amber-400 font-medium">92%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '92%' }}></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="erp-card flex-1 dash-anim-el">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-white">Cross-Department Alerts</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                                <Activity className="text-red-400 mt-0.5" size={16} />
                                <div>
                                    <p className="text-sm font-semibold text-red-200">Inventory Expiry Alert</p>
                                    <p className="text-xs text-red-400/80 mt-0.5">{expiryAnalytics.expired} items already expired. IMMEDIATE ACTION REQUIRED.</p>
                                </div>
                            </div>
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                                <Box className="text-amber-400 mt-0.5" size={16} />
                                <div>
                                    <p className="text-sm font-semibold text-amber-200">Stock Risk Warning</p>
                                    <p className="text-xs text-amber-400/80 mt-0.5">{expiryAnalytics.soon} items will expire within 30 days.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
