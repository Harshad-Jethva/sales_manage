import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, TrendingUp, AlertTriangle,
    ArrowRight, Clock, CheckCircle, ShoppingCart,
    Truck, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const WarehouseDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStock: 0,
        lowStockItems: 0,
        pendingOrders: 0,
        fulfilledToday: 0
    });

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost/sales_manage/backend/api/warehouse/dashboard.php');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching warehouse stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Inventory', value: stats.totalStock, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: '+2.4%' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-5%' },
        { label: 'Low Stock Alerts', value: stats.lowStockItems, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Critical' },
        { label: ' Fulfilled Today', value: stats.fulfilledToday, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+12%' },
    ];

    const quickActions = [
        { name: 'Receive Orders', desc: 'Process salesman orders', path: '/warehouse/receive-order', icon: Truck, color: 'bg-blue-600' },
        { name: 'Inventory List', desc: 'Manage warehouse stock', path: '/warehouse/inventory', icon: ShoppingCart, color: 'bg-purple-600' },
        { name: 'Stock Reports', desc: 'View movement analytics', path: '/warehouse/reports', icon: BarChart3, color: 'bg-emerald-600' },
    ];

    return (
        <div className="warehouse-dashboard p-4 lg:p-8">
            <Helmet>
                <title>Warehouse Dashboard | HAB CREATION</title>
            </Helmet>

            <div className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tight">Warehouse Control</h1>
                <p className="text-gray-400 mt-2 text-lg">Real-time inventory management and order fulfillment tracking.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:border-white/20 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <card.icon size={28} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${card.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-400 font-medium">{card.label}</h3>
                        <p className="text-3xl font-black text-white mt-1">{card.value.toLocaleString()}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-400" />
                        Quick Operations
                    </h3>
                    {quickActions.map((action, i) => (
                        <motion.button
                            key={action.name}
                            whileHover={{ x: 8 }}
                            onClick={() => navigate(action.path)}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-all group"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                <action.icon size={22} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold">{action.name}</h4>
                                <p className="text-gray-500 text-xs">{action.desc}</p>
                            </div>
                            <ArrowRight className="text-gray-600 group-hover:text-white transition-colors" size={18} />
                        </motion.button>
                    ))}
                </div>

                {/* Recent Movement / Alerts */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white">Stock Movement Alerts</h3>
                            <button className="text-indigo-400 text-sm font-bold hover:underline">View All Logs</button>
                        </div>

                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="w-2 h-12 bg-amber-500 rounded-full" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-medium">Low Stock: Premium Cotton Fabric</h4>
                                            <span className="text-[10px] text-gray-500">2 hours ago</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">Current qty: 45 meters. Minimum threshold is 100 meters.</p>
                                    </div>
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white transition-all">
                                        Create PO
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDashboard;
