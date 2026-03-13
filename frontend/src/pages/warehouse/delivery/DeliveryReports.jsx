import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Filter, Search, Download, RefreshCw, Calendar as CalendarIcon, Package, Truck, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/common/SEO';

const DeliveryReports = () => {
    const [performance, setPerformance] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDateBase, setFilterDateBase] = useState('All Time');

    useEffect(() => {
        fetchReports();
    }, [filterDateBase]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost/sales_manage/backend/api/delivery/reports.php?action=summary';
            if (filterDateBase === 'Today') {
                const today = new Date().toISOString().split('T')[0];
                url += `&start_date=${today}&end_date=${today}`;
            } else if (filterDateBase === 'This Week') {
                const today = new Date();
                const firstDay = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
                const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];
                url += `&start_date=${firstDay}&end_date=${lastDay}`;
            }

            const res = await axios.get(url);
            if (res.data.success) {
                setPerformance(res.data.performance);
                setDeliveries(res.data.deliveries);
            } else {
                toast.error('Failed to load reports');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching reports');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delivery-reports-container">
            <SEO title="Delivery Performance Reports" description="Comprehensive delivery performance and historical data." />

            <div className="page-header mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                            <BarChart3 size={32} />
                        </div>
                        Delivery Reports
                    </h1>
                    <p className="text-slate-400 mt-2">Analyze delivery staff performance and recent activity.</p>
                </div>

                <div className="flex gap-3">
                    <select 
                        className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-white outline-none"
                        value={filterDateBase}
                        onChange={(e) => setFilterDateBase(e.target.value)}
                    >
                        <option value="All Time">All Time</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                    </select>
                    <button 
                        onClick={fetchReports}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50 hover:bg-slate-700 transition"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-indigo-400" /> Staff Performance Leaderboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl h-32 animate-pulse" />
                    ))
                ) : performance.length > 0 ? (
                    performance.map((p, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-white truncate pr-2">{p.delivery_name || 'Unassigned'}</h3>
                                <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                    <Truck size={18} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Completed</div>
                                    <div className="text-emerald-400 font-bold text-xl">{p.total_completed}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Failed</div>
                                    <div className="text-red-400 font-bold text-xl">{p.total_failed}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-slate-500">No performance data found for selected period.</div>
                )}
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="text-indigo-400" /> Recent Delivery Logs (Top 100)
            </h2>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50">
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                            <th className="p-4">Staff Name</th>
                            <th className="p-4">Order Number</th>
                            <th className="p-4">Delivery Status</th>
                            <th className="p-4">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="4" className="text-center p-6 text-slate-500">Loading...</td></tr>
                        ) : deliveries.length > 0 ? (
                            deliveries.map((d, i) => (
                                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-semibold text-white">{d.delivery_name}</td>
                                    <td className="p-4 text-slate-300 font-mono">#{d.order_number}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border
                                            ${d.delivery_status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                              d.delivery_status === 'Failed Delivery' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                              'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                        >
                                            {d.delivery_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{d.updated_at}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center p-6 text-slate-500">No recent logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};

export default DeliveryReports;
