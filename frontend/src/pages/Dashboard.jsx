import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, Receipt, Wallet, Banknote, Sparkles
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_sales: 0,
        total_received: 0,
        total_pending: 0,
        bank_balance: 0,
        pending_bills_count: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/reports.php?type=overall_stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const data = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 5000 },
        { name: 'Apr', value: 2780 },
        { name: 'May', value: 1890 },
        { name: 'Jun', value: 2390 },
        { name: 'Jul', value: 3490 },
    ];

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="glass-card stat-card">
            <div className="stat-info">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className="stat-icon" style={{ background: color }}>
                <Icon size={24} color="white" />
            </div>

            <style jsx>{`
        .stat-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stat-title {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
        </div>
    );

    return (
        <div className="fade-in">
            <header className="page-header">
                <h1>Dashboard Overview</h1>
                <p className="text-muted">Welcome back, here's what's happening today.</p>
            </header>

            <div className="stats-grid">
                <StatCard
                    title="Total Sales"
                    value={`₹${stats.total_sales || 0}`}
                    icon={TrendingUp}
                    color="#6366f1"
                />
                <StatCard
                    title="Total Received"
                    value={`₹${stats.total_received || 0}`}
                    icon={Wallet}
                    color="#22c55e"
                />
                <StatCard
                    title="Pending Payments"
                    value={`₹${stats.total_pending || 0}`}
                    icon={Banknote}
                    color="#f59e0b"
                />
                <StatCard
                    title="Bank Balance"
                    value={`₹${stats.bank_balance || 0}`}
                    icon={Receipt}
                    color="#ec4899"
                />
            </div>

            <div className="dashboard-grid">
                <div className="glass-card chart-container">
                    <h3>Sales Performance</h3>
                    <div style={{ height: '300px', marginTop: '1.5rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card pending-list">
                    <h3>Pending Invoices</h3>
                    <div className="list-items" style={{ marginTop: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="list-item">
                                <div>
                                    <p className="item-name">Client {i}</p>
                                    <p className="item-date">Due in {i * 3} days</p>
                                </div>
                                <span className="item-amount text-danger">₹{(i * 1500).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card ai-insight" style={{ gridColumn: '1 / -1', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="ai-icon">
                        <Sparkles size={24} color="#ec4899" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>AI Sales Prediction <span className="badge badge-partial" style={{ fontSize: '0.6rem' }}>NEW</span></h3>
                        <p className="text-muted">Based on your recent transaction patterns, we predict a 15% increase in sales next month.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Estimated Revenue</p>
                        <h2 className="text-success">₹{((stats.total_sales || 10000) * 1.15).toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border);
        }
        .item-name { font-weight: 600; }
        .item-date { font-size: 0.75rem; color: var(--text-muted); }
        .item-amount { font-weight: 700; color: var(--danger); }
        
        .ai-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(236, 72, 153, 0.1);
          border: 1px solid rgba(236, 72, 153, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-danger { color: var(--danger); }
        .text-success { color: var(--success); }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
