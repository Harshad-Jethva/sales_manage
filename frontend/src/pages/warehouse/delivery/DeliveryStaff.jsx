import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Truck, UserPlus, Search, Filter, Edit, Trash2, Key,
    CheckCircle, XCircle, MoreVertical, Shield, Mail, Phone,
    ChevronDown, ArrowLeft, Save, X, RefreshCw, MapPin, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../../components/common/SEO';
import gsap from 'gsap';

const DeliveryStaff = () => {
    const [staff, setStaff] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        vehicle_details: '',
        warehouse_id: ''
    });

    const containerRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".staff-card-anim",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [loading, filterStatus, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, storeRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/delivery/staff.php?action=list'),
                axios.get('http://localhost/sales_manage/backend/api/stores.php')
            ]);
            
            if (staffRes.data.success) {
                setStaff(staffRes.data.data);
            } else {
                toast.error('Failed to fetch delivery staff');
            }

            if (storeRes.data.success) {
                setWarehouses(storeRes.data.data || storeRes.data); // Adjust based on common structure
            }

        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (person = null) => {
        if (person) {
            setEditingStaff(person);
            setFormData({
                id: person.id,
                name: person.name,
                mobile: person.mobile,
                address: person.address || '',
                vehicle_details: person.vehicle_details || '',
                warehouse_id: person.warehouse_id || ''
            });
        } else {
            setEditingStaff(null);
            setFormData({
                name: '',
                mobile: '',
                address: '',
                vehicle_details: '',
                warehouse_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingStaff ? 'Updating staff...' : 'Adding staff...');

        try {
            const url = `http://localhost/sales_manage/backend/api/delivery/staff.php?action=${editingStaff ? 'update' : 'add'}`;
            const res = await axios.post(url, formData);

            if (res.data.success) {
                toast.success(res.data.message, { id: loadingToast });
                handleCloseModal();
                fetchData();
            } else {
                toast.error(res.data.error || 'Action failed', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Action failed', { id: loadingToast });
        }
    };

    const toggleStatus = async (person) => {
        const loadingToast = toast.loading(`Updating status...`);
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/delivery/staff.php?action=toggle_status', {
                id: person.id
            });
            if (res.data.success) {
                toast.success(`Status updated to ${res.data.newStatus}`, { id: loadingToast });
                fetchData();
            } else {
                toast.error(res.data.error || 'Failed to update status', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status', { id: loadingToast });
        }
    };

    const filteredStaff = staff.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            s.name.toLowerCase().includes(term) ||
            s.mobile.includes(term) ||
            (s.username && s.username.toLowerCase().includes(term));

        const matchesStatus = filterStatus === 'All' ? true : s.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="delivery-staff-container" ref={containerRef}>
            <SEO title="Delivery Staff Management" description="Manage delivery personnel accounts." />

            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500">
                            <Truck size={32} />
                        </div>
                        Delivery Staff Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage delivery personnel, assign warehouses, and handle accounts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="erp-button erp-button-primary"
                    >
                        <UserPlus size={18} />
                        <span>Add Delivery Person</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, mobile, username..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-all backdrop-blur-sm min-w-[180px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl h-48 animate-pulse"></div>
                    ))
                ) : filteredStaff.length > 0 ? (
                    filteredStaff.map((person) => (
                        <motion.div
                            key={person.id}
                            layout
                            className="staff-card-anim group bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden flex flex-col backdrop-blur-sm shadow-xl"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(person); }}
                                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${
                                        person.status === 'Active'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                    }`}
                                >
                                    {person.status}
                                </button>
                            </div>

                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {person.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <h3 className="text-white font-bold text-base truncate pr-2">{person.name}</h3>
                                    <div className="text-slate-500 text-xs font-mono truncate">@{person.username || person.mobile}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={12} className="text-slate-500" /> {person.mobile}
                                </div>
                                {person.warehouse_name && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                                        <MapPin size={12} className="text-slate-500" /> {person.warehouse_name}
                                    </div>
                                )}
                                {person.vehicle_details && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                                        <Truck size={12} className="text-slate-500" /> {person.vehicle_details}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/30">
                                <button
                                    onClick={() => handleOpenModal(person)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                                >
                                    <Edit size={14} /> <span className="text-xs">Edit Details</span>
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <Users size={48} className="text-slate-600 mb-4" />
                        <h3 className="text-xl font-medium text-slate-300">No delivery staff found</h3>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={handleCloseModal} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-3xl shadow-2xl z-20 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">{editingStaff ? 'Edit Staff' : 'Add Delivery Staff'}</h2>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                                    <input type="text" name="name" required className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Mobile Number</label>
                                        <input type="text" name="mobile" required className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.mobile} onChange={handleInputChange} />
                                        {!editingStaff && <span className="text-[10px] text-slate-500">Will be used as initial password</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400">Assigned Warehouse</label>
                                        <select name="warehouse_id" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.warehouse_id} onChange={handleInputChange}>
                                            <option value="">Select Warehouse</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name || `Store ${w.id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400">Vehicle Details (Optional)</label>
                                    <input type="text" name="vehicle_details" placeholder="e.g. DL-14-1234 (Bike)" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" value={formData.vehicle_details} onChange={handleInputChange} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400">Address (Optional)</label>
                                    <textarea name="address" rows="2" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white resize-none" value={formData.address} onChange={handleInputChange}></textarea>
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                                    <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">
                                        {editingStaff ? 'Save Changes' : 'Add Staff'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .erp-button {
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem; font-weight: 600; transition: all 0.2s ease;
                }
                .erp-button-primary { background: var(--enterprise-gradient, linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)); color: white; }
                .erp-button-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
            `}</style>
        </div>
    );
};

export default DeliveryStaff;
