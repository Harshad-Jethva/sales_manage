import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  MapPin, Truck, Users, Package, ChevronRight,
  TrendingDown, Activity
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/sales_manage/backend/api';

const TransportReports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_shipments: 0,
    transport_wise: [],
    client_wise: [],
    route_summary: []
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/warehouse/transport.php?action=get_reports`);
      if (resp.data.success) {
        setData(resp.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 ${color} opacity-10 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={80} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-')}/20 ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1">{value}</h2>
          {trend && (
            <div className={`text-xs font-bold flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}% from last month
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-[#0B0F19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Logistics Intelligence
          </h1>
          <p className="text-gray-400 mt-2">Comprehensive analytics of your transportation operations.</p>
        </motion.div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/20 transition-all">
            <Download size={18} /> Excel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
            <Download size={18} /> PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aggregating Statistics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Shipments" 
              value={data.total_shipments} 
              icon={Package} 
              color="text-indigo-400"
              trend={12}
            />
            <StatCard 
              title="Avg Delivery Time" 
              value="1.4 Days" 
              icon={Activity} 
              color="text-emerald-400"
              trend={-5}
            />
            <StatCard 
              title="Partner Carriers" 
              value={data.transport_wise.length} 
              icon={Truck} 
              color="text-purple-400"
            />
            <StatCard 
              title="Active Clusters" 
              value={data.route_summary.length} 
              icon={MapPin} 
              color="text-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transport-wise Distribution */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-400" /> Carrier Performance
                </h3>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">By Shipment Count</span>
              </div>
              
              <div className="space-y-6">
                {data.transport_wise.map((item, idx) => {
                  const percentage = Math.round((item.count / data.total_shipments) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-300">{item.transport_name}</span>
                        <span className="text-white">{item.count} <span className="text-gray-500 text-xs ml-1">({percentage}%)</span></span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* City-wise Hotspots */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapPin size={20} className="text-emerald-400" /> Destination Hotspots
                </h3>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Top Delivery Regions</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {data.route_summary.map((item, idx) => (
                   <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <MapPin size={14} />
                         </div>
                         <span className="text-sm font-bold text-gray-300">{item.destination_city}</span>
                      </div>
                      <div className="text-lg font-black text-white">{item.count}</div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-8 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                 <p className="text-xs text-indigo-300 font-medium leading-relaxed italic">
                   "Most shipments are trending towards north-eastern zones this quarter."
                 </p>
              </div>
            </motion.div>
          </div>

          {/* Client-wise Summary Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
               <h3 className="font-bold flex items-center gap-2">
                 <Users size={18} className="text-blue-400" /> Client Dispatch distribution
               </h3>
               <button className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
                 View All Details <ChevronRight size={14} />
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
               {data.client_wise.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-indigo-400 border border-white/10">
                       {item.client_name.charAt(0)}
                    </div>
                    <div>
                       <div className="font-bold text-sm truncate max-w-[150px]">{item.client_name}</div>
                       <div className="text-xs text-gray-500 font-medium">{item.count} Total Dispatches</div>
                    </div>
                    <div className="ml-auto text-indigo-400">
                       <TrendingUp size={16} />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransportReports;
