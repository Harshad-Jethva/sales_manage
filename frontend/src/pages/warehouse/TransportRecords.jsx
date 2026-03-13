import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, ExternalLink, 
  Truck, Calendar, User, UserCheck, 
  FileText, MessageSquare, ChevronLeft, ChevronRight,
  MoreVertical, Trash2, Eye, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/sales_manage/backend/api';

const TransportRecords = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    client_name: '',
    transport_name: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchRecords();
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchRecords = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(appliedFilters).toString();
      const resp = await axios.get(`${API_BASE_URL}/warehouse/transport.php?${queryParams}`);
      if (resp.data.success) {
        setRecords(resp.data.data);
      } else {
        toast.error(resp.data.message || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchRecords();
  };

  const resetFilters = () => {
    const defaultFilters = {
      start_date: '',
      end_date: '',
      client_name: '',
      transport_name: ''
    };
    setFilters(defaultFilters);
    fetchRecords(defaultFilters);
  };

  const handleResendWhatsApp = async (id) => {
    toast.loading('Pushing to WhatsApp queue...');
    try {
      const resp = await axios.post(`http://localhost:5000/send-transport-whatsapp`, { builty_id: id });
      toast.dismiss();
      if (resp.data.success) {
        toast.success('WhatsApp sent successfully!');
        fetchRecords();
      } else {
        toast.error(resp.data.message || 'Failed to send WhatsApp');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error resending WhatsApp:', error);
      toast.error('Automation service unreachable');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transport record?')) return;
    try {
      const resp = await axios.delete(`${API_BASE_URL}/warehouse/transport.php?id=${id}`);
      if (resp.data.success) {
        toast.success('Record deleted');
        fetchRecords();
      } else {
        toast.error(resp.data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredRecords = records.filter(r => 
    r.builty_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.transport_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-[#0B0F19] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Transport Records
          </h1>
          <p className="text-gray-400 mt-2">Track history, download documents, and check WhatsApp status.</p>
        </motion.div>

        <div className="flex items-center gap-3">
           <button 
             onClick={fetchRecords}
             className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
           >
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all">
             <Download size={18} />
             Export PDF
           </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 mb-8 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative col-span-1 lg:col-span-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search builty, client..."
               className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
             />
          </div>
          <div>
            <input 
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <input 
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <input 
              type="text"
              name="transport_name"
              value={filters.transport_name}
              onChange={handleFilterChange}
              placeholder="Transport Co."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={applyFilters}
              className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl px-4 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Filter size={16} /> Filter
            </button>
            <button 
              onClick={resetFilters}
              className="bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Builty #</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Client & Order</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Transport / Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Dispatch Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Crunching data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                    No transport records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="hover:bg-white/3 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-indigo-400 font-bold">{record.builty_number}</span>
                        <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">ID: {record.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{record.client_name}</div>
                          <div className="text-xs text-gray-500 font-medium">Order: {record.order_number || 'Standalone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold">{record.transport_name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Truck size={12} /> {record.vehicle_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-xs font-medium">
                            <Calendar size={12} className="text-purple-400" />
                            {new Date(record.dispatch_date).toLocaleDateString()}
                         </div>
                         <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                           To: {record.destination_city}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                         record.whatsapp_status === 'Sent' 
                         ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                         : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                       }`}>
                         <MessageSquare size={10} />
                         {record.whatsapp_status || 'Pending'}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         {record.builty_document_path && (
                           <a 
                             href={`http://localhost/sales_manage/backend${record.builty_document_path}`} 
                             target="_blank" 
                             rel="noreferrer"
                             className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all shadow-lg border border-blue-500/20"
                             title="Quick View"
                           >
                             <Eye size={16} />
                           </a>
                         )}
                         <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === record.id ? null : record.id);
                              }}
                              className={`p-2.5 rounded-xl transition-all border ${
                                activeMenu === record.id 
                                ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <MoreVertical size={16} />
                            </button>

                            <AnimatePresence>
                              {activeMenu === record.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute right-0 top-full mt-3 w-56 bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden"
                                >
                                   <div className="p-2 space-y-1">
                                      <button 
                                        onClick={() => handleResendWhatsApp(record.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-all group/item"
                                      >
                                         <div className="p-1.5 rounded-lg bg-indigo-500/10 group-hover/item:bg-indigo-500/20">
                                           <MessageSquare size={14} />
                                         </div>
                                         <span className="font-semibold">Resend Alert</span>
                                      </button>
                                      
                                      <button 
                                        onClick={() => window.open(`http://localhost/sales_manage/backend${record.builty_document_path}`, '_blank')}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-xl hover:bg-white/5 text-gray-300 transition-all group/item"
                                      >
                                         <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-white/10 text-emerald-400">
                                           <FileText size={14} />
                                         </div>
                                         <span className="font-semibold">Download Builty</span>
                                      </button>
                                      
                                      <div className="h-px bg-white/5 mx-2 my-1"></div>
                                      
                                      <button 
                                        onClick={() => handleDelete(record.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-xl hover:bg-red-500/10 text-red-400 transition-all group/item"
                                      >
                                         <div className="p-1.5 rounded-lg bg-red-500/10 group-hover/item:bg-red-500/20">
                                           <Trash2 size={14} />
                                         </div>
                                         <span className="font-semibold">Delete Record</span>
                                      </button>
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
           <span className="text-xs text-gray-500 font-medium">Showing {filteredRecords.length} records</span>
           <div className="flex gap-2">
             <button disabled className="p-1.5 rounded-lg border border-white/5 text-gray-600 cursor-not-allowed">
               <ChevronLeft size={16} />
             </button>
             <button disabled className="p-1.5 rounded-lg border border-white/5 text-gray-600 cursor-not-allowed">
               <ChevronRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRecords;
