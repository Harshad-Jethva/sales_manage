import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Users, UserPlus, Search, Filter, Edit, Trash2,
    CheckCircle, XCircle, MoreVertical, Mail, Phone,
    ChevronDown, Save, X, RefreshCw, IndianRupee, MapPin, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import gsap from 'gsap';

const ClientManagement = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        outstanding_balance: 0,
        credit_limit: 0,
        status: 'active',
        company: '',
        shop_name: '',
        city: '',
        state: ''
    });

    const containerRef = useRef(null);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".client-row-anim",
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [loading, searchTerm]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/clients.php');
            if (res.data.success) {
                setClients(res.data.data);
            } else {
                toast.error('Failed to fetch clients');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching clients');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                id: client.id,
                name: client.name,
                phone: client.phone || '',
                email: client.email || '',
                address: client.address || '',
                gstin: client.gstin || '',
                outstanding_balance: client.outstanding_balance || 0,
                credit_limit: client.credit_limit || 0,
                status: client.status || 'active',
                company: client.company || '',
                shop_name: client.shop_name || '',
                city: client.city || '',
                state: client.state || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                gstin: '',
                outstanding_balance: 0,
                credit_limit: 0,
                status: 'active',
                company: '',
                shop_name: '',
                city: '',
                state: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingClient ? 'Updating client...' : 'Adding client...');

        try {
            let res;
            if (editingClient) {
                res = await axios.put('http://localhost/sales_manage/backend/api/clients.php', formData);
            } else {
                res = await axios.post('http://localhost/sales_manage/backend/api/clients.php', formData);
            }

            if (res.data.success) {
                toast.success(res.data.message, { id: loadingToast });
                handleCloseModal();
                fetchClients();
            } else {
                toast.error(res.data.message || res.data.error, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Action failed', { id: loadingToast });
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;

        const loadingToast = toast.loading('Deleting client...');
        try {
            const res = await axios.delete(`http://localhost/sales_manage/backend/api/clients.php?id=${id}`);
            if (res.data.success) {
                toast.success('Client deleted successfully', { id: loadingToast });
                fetchClients();
            } else {
                toast.error(res.data.message || res.data.error, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete client', { id: loadingToast });
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredClients = clients.filter(c => {
        const term = searchTerm.toLowerCase();
        return (
            c.name.toLowerCase().includes(term) ||
            c.id.toString().includes(term) ||
            (c.phone && c.phone.includes(term)) ||
            (c.outstanding_balance && c.outstanding_balance.toString().includes(term))
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    return (
        <div className="client-mgmt-container" ref={containerRef}>
            <SEO title="Client Management | Admin" description="Manage clients, credit limits and outstanding balances." />

            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                            <Users size={32} />
                        </div>
                        Client Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage customer details, credit and account status.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchClients}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="erp-button erp-button-primary"
                    >
                        <UserPlus size={18} />
                        <span>Add New Client</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{clients.length}</h2>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Outstanding</p>
                            <h2 className="text-3xl font-bold text-red-400 mt-1">
                                ₹{clients.reduce((acc, c) => acc + parseFloat(c.outstanding_balance || 0), 0).toLocaleString()}
                            </h2>
                        </div>
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                            <IndianRupee size={24} />
                        </div>
                    </div>
                </div>
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Active Accounts</p>
                            <h2 className="text-3xl font-bold text-emerald-400 mt-1">
                                {clients.filter(c => c.status === 'active').length}
                            </h2>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, ID, Mobile or Balance..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Professional Responsive Table */}
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Client ID</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Client Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Contact</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">GST Number</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Outstanding</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Credit Limit</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(8).fill(0).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : currentItems.length > 0 ? (
                                currentItems.map((client) => (
                                    <tr key={client.id} className="client-row-anim border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">#C-{client.id.toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{client.name}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{client.shop_name || client.company || 'No Shop Name'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Phone size={14} className="text-slate-500" /> {client.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <Mail size={12} className="text-slate-500" /> {client.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{client.gstin || 'No GST'}</td>
                                        <td className="px-6 py-4">
                                            <div className={`font-bold ${parseFloat(client.outstanding_balance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                ₹{parseFloat(client.outstanding_balance || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">₹{parseFloat(client.credit_limit || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${client.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(client)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-20 text-center text-slate-500">No clients found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === number
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={handleCloseModal} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-3xl rounded-3xl shadow-2xl z-20 overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{editingClient ? 'Edit Client Details' : 'Add New Client'}</h2>
                                    <p className="text-slate-400 text-xs mt-1">Configure client information and credit terms.</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-emerald-400 text-sm font-bold flex items-center gap-2"><Users size={16} /> Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Client Name *</label>
                                            <input type="text" name="name" required className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Shop / Company Name</label>
                                            <input type="text" name="shop_name" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.shop_name} onChange={handleInputChange} placeholder="e.g. Acme Stores" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Mobile Number</label>
                                            <input type="tel" name="phone" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Email Address</label>
                                            <input type="email" name="email" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.email} onChange={handleInputChange} placeholder="client@example.com" />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="space-y-4">
                                    <h3 className="text-emerald-400 text-sm font-bold flex items-center gap-2"><IndianRupee size={16} /> Financial Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Outstanding Balance (₹)</label>
                                            <input type="number" name="outstanding_balance" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.outstanding_balance} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Credit Limit (₹)</label>
                                            <input type="number" name="credit_limit" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.credit_limit} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">GST Number</label>
                                            <input type="text" name="gstin" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all uppercase" value={formData.gstin} onChange={handleInputChange} placeholder="24AAAAA0000A1Z5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Info */}
                                <div className="space-y-4">
                                    <h3 className="text-emerald-400 text-sm font-bold flex items-center gap-2"><MapPin size={16} /> Address Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Full Address</label>
                                            <textarea name="address" rows="2" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all resize-none" value={formData.address} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">City</label>
                                            <input type="text" name="city" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">State</label>
                                            <input type="text" name="state" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.state} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Account Status</label>
                                            <select name="status" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all" value={formData.status} onChange={handleInputChange}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3 flex-shrink-0">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                                        <Save size={20} />
                                        {editingClient ? 'Update Client Account' : 'Save New Client'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .erp-button {
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
                    border-radius: 1rem; font-weight: 700; transition: all 0.3s ease;
                }
                .erp-button-primary { 
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                    color: white; 
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                }
                .erp-button-primary:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.1); }
                
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default ClientManagement;
