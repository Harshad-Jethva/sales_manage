import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/common/SEO';

const DeliveryDashboard = () => {
    const [stats, setStats] = useState({
        active_deliveries: 0,
        pending_deliveries: 0,
        completed_deliveries: 0,
        failed_deliveries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/delivery/tracking.php?action=dashboard_stats');
            if (res.data.success && res.data.data) {
                setStats({
                    active_deliveries: res.data.data.active_deliveries || 0,
                    pending_deliveries: res.data.data.pending_deliveries || 0,
                    completed_deliveries: res.data.data.completed_deliveries || 0,
                    failed_deliveries: res.data.data.failed_deliveries || 0,
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Active Deliveries', value: stats.active_deliveries, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pending Assignment', value: stats.pending_deliveries, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Completed Deliveries', value: stats.completed_deliveries, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Failed Deliveries', value: stats.failed_deliveries, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="delivery-dashboard-container">
            <SEO title="Delivery Dashboard" description="Overview of warehouse deliveries." />

            <div className="page-header mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                        <Package size={32} />
                    </div>
                    Delivery Dashboard
                </h1>
                <p className="text-slate-400 mt-2">Logistics overview and real-time statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-xl"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                            <card.icon size={28} />
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm font-semibold uppercase">{card.label}</div>
                            <div className="text-3xl font-black text-white">{loading ? '...' : card.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl min-h-[400px]">
                <h2 className="text-white font-bold text-xl mb-4">Live Tracking Map</h2>
                <div className="text-slate-400 mb-4">Please navigate to the Tracking System page for full-screen live tracking and route path visualization.</div>
                
                <div className="flex justify-center mt-12">
                     <a href="/warehouse/delivery-tracking" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex gap-2 items-center transition">
                         <Truck size={20} /> Open Live Tracking Radar
                     </a>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
