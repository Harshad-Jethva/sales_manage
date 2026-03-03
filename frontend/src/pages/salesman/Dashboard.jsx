import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Users,
    TrendingUp,
    ShoppingBag,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_orders: 0,
        today_orders: 0,
        total_clients: 0,
        total_sales: 0,
        monthly_sales: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        if (!user?.id) return;
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/dashboard.php?salesman_id=${user.id}`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Orders',
            value: stats.total_orders,
            icon: ShoppingBag,
            color: 'blue',
            trend: '+12%',
            trendUp: true
        },
        {
            label: "Today's Orders",
            value: stats.today_orders,
            icon: Calendar,
            color: 'purple',
            trend: '+5%',
            trendUp: true
        },
        {
            label: 'Total Clients',
            value: stats.total_clients,
            icon: Users,
            color: 'emerald',
            trend: '+2',
            trendUp: true
        },
        {
            label: 'Total Sales',
            value: `₹${parseFloat(stats.total_sales).toLocaleString()}`,
            icon: TrendingUp,
            color: 'amber',
            trend: '+18%',
            trendUp: true
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="salesman-dashboard p-4 lg:p-8">
            <Helmet>
                <title>Salesman Dashboard | HAB CREATION</title>
            </Helmet>

            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-400 mt-2">Here's your sales summary and performance overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="stat-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-indigo-400 font-medium cursor-pointer hover:text-indigo-300">
                            View details <ChevronRight size={14} className="ml-1" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Chart Placeholder */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Monthly Sales Performance</h3>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300 outline-none">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end gap-2 px-2 mt-8">
                        {stats.monthly_sales.map((month, idx) => (
                            <div key={month.month} className="flex-1 flex flex-col items-center group">
                                <div
                                    className="w-full bg-indigo-500/40 group-hover:bg-indigo-500 transition-all duration-300 rounded-t-lg"
                                    style={{ height: `${(month.amount / Math.max(...stats.monthly_sales.map(m => m.amount), 1)) * 100}%` }}
                                ></div>
                                <p className="text-[10px] text-gray-500 mt-2 rotate-45 lg:rotate-0">{month.month}</p>
                            </div>
                        ))}
                        {stats.monthly_sales.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                No recent sales data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/salesman/place-order'}
                            className="w-full p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-between transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            <div className="flex items-center gap-3">
                                <PlusSquare size={20} />
                                <span>Place New Order</span>
                            </div>
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => window.location.href = '/salesman/client-history'}
                            className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-medium flex items-center justify-between transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} />
                                <span>My Clients</span>
                            </div>
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => window.location.href = '/salesman/order-history'}
                            className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-medium flex items-center justify-between transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <History size={20} />
                                <span>View Order History</span>
                            </div>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .stat-card {
           position: relative;
           overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 70%);
          pointer-events: none;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
      `}</style>
        </div>
    );
};

// Simple icons for buttons (not imported from lucide-react in previous block to avoid errors if not exist)
const PlusSquare = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const History = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;

export default Dashboard;
