import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, User, Smartphone, Hash, Navigation, 
  Building2, Calendar, FileUp, Save, Send, 
  CheckCircle2, AlertCircle, Search, Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/sales_manage/backend/api';

const TransportManagement = () => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    transport_name: '',
    driver_name: '',
    driver_mobile: '',
    vehicle_number: '',
    transport_type: 'Truck',
    dispatch_date: new Date().toISOString().split('T')[0],
    destination_city: '',
    client_id: '',
    order_id: '',
    builty_number: '',
    builty_document: null
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      fetchClientOrders(formData.client_id);
      const client = clients.find(c => c.id === parseInt(formData.client_id));
      setSelectedClient(client);
      if (client?.city) {
        setFormData(prev => ({ ...prev, destination_city: client.city }));
      }
    } else {
      setClientOrders([]);
      setSelectedClient(null);
    }
  }, [formData.client_id, clients]);

  const fetchClients = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/clients.php`);
      if (resp.data.success) {
        setClients(resp.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const fetchClientOrders = async (clientId) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/salesman/orders.php?client_id=${clientId}`);
      if (resp.data.success) {
        setClientOrders(resp.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, builty_document: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) return toast.error('Please select a client');

    setLoading(true);
    const postData = new FormData();
    Object.keys(formData).forEach(key => {
      postData.append(key, formData[key]);
    });

    try {
      const resp = await axios.post(`${API_BASE_URL}/warehouse/transport.php`, postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (resp.data.success) {
        toast.success(resp.data.message || 'Transport record saved successfully!');
        // Reset form
        setFormData({
          transport_name: '',
          driver_name: '',
          driver_mobile: '',
          vehicle_number: '',
          transport_type: 'Truck',
          dispatch_date: new Date().toISOString().split('T')[0],
          destination_city: '',
          client_id: '',
          order_id: '',
          builty_number: '',
          builty_document: null
        });
        setClientOrders([]);
        setSelectedClient(null);
      } else {
        toast.error(resp.data.message || 'Failed to save record');
      }
    } catch (error) {
      console.error('Error saving transport:', error);
      toast.error('Internal server error');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-[#0B0F19] text-white">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Transport Management
          </h1>
          <p className="text-gray-400 mt-2">Manage logistics, builty documents, and customer dispatch alerts.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Truck size={20} />
          </div>
          <div>
            <div className="text-sm font-medium">Auto-WhatsApp Enabled</div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Automation
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Transport Info */}
            <section className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Truck size={120} />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">1</div>
                <h2 className="text-xl font-bold">Transport Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Building2 size={14} /> Transport Company Name
                  </label>
                  <input 
                    required
                    name="transport_name"
                    value={formData.transport_name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="e.g. BlueDart, VRL Logistics"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User size={14} /> Driver Name
                  </label>
                  <input 
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter driver name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Smartphone size={14} /> Driver Mobile
                  </label>
                  <input 
                    name="driver_mobile"
                    value={formData.driver_mobile}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Driver contact #"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Hash size={14} /> Vehicle Number
                  </label>
                  <input 
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="e.g. GJ 01 AB 1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Truck size={14} /> Transport Type
                  </label>
                  <select 
                    name="transport_type"
                    value={formData.transport_type}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    <option value="Truck" className='bg-slate-900'>Truck</option>
                    <option value="Tempo" className='bg-slate-900'>Tempo</option>
                    <option value="Courier" className='bg-slate-900'>Courier</option>
                    <option value="Other" className='bg-slate-900'>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar size={14} /> Dispatch Date
                  </label>
                  <input 
                    type="date"
                    name="dispatch_date"
                    value={formData.dispatch_date}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Builty Info */}
            <section className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 backdrop-blur-md relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">2</div>
                <h2 className="text-xl font-bold">Builty & Documentation</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Hash size={14} /> Builty Number
                  </label>
                  <input 
                    name="builty_number"
                    value={formData.builty_number}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter manual builty #"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <FileUp size={14} /> Upload Builty (PDF/Image)
                  </label>
                  <input 
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-4">
              <button 
                type="button" 
                className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="group relative px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save size={18} />
                    Process Shipment
                    <motion.div 
                      className="absolute -right-2 -top-2 bg-green-500 text-[10px] text-white px-2 py-0.5 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      SENDS WHATSAPP
                    </motion.div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Linking & Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Client Selection */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LinkIcon size={18} className="text-indigo-400" /> Link Client & Order
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Choose Client</label>
                <select 
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="" className="bg-slate-900">-- Select Client --</option>
                  {filteredClients.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>

              <AnimatePresence>
                {formData.client_id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Choose Order (Optional)</label>
                      <select 
                        name="order_id"
                        value={formData.order_id}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="" className="bg-slate-900">Not linked to specific order</option>
                        {clientOrders.map(o => (
                          <option key={o.id} value={o.id} className="bg-slate-900">
                            #{o.order_number} - {o.total_amount} ({(new Date(o.order_date)).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                      <div className="text-xs text-indigo-400 font-bold mb-3 flex items-center justify-between">
                        CLIENT DETAILS
                        <CheckCircle2 size={12} />
                      </div>
                      {selectedClient && (
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-400">
                              <span>Mobile</span>
                              <span className="text-white font-medium">{selectedClient.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Destination</span>
                              <span className="text-white font-medium">{selectedClient.city || 'N/A'}</span>
                            </div>
                            <div className="text-gray-400 mt-2">
                              <span className="block mb-1">Address</span>
                              <span className="text-white text-xs leading-relaxed line-clamp-2 italic">
                                {selectedClient.address || 'No address provided'}
                              </span>
                            </div>
                         </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Summary / Status */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4">Shipment Snapshot</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Navigation size={14} className="text-purple-400" />
                Destination: <span className="text-white ml-auto">{formData.destination_city || '---'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Smartphone size={14} className="text-green-400" />
                WhatsApp: <span className="text-white ml-auto">{selectedClient?.phone ? 'Ready' : 'Missing Mobile'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Hash size={14} className="text-indigo-400" />
                Builty #: <span className="text-white ml-auto font-mono text-xs">{formData.builty_number || 'Auto-Generate'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>Saving this record will automatically generate a PDF and send it to the client via WhatsApp.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TransportManagement;
