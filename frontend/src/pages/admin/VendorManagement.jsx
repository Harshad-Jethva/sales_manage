import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Truck, UserPlus, Search, Edit, Trash2,
    CheckCircle, XCircle, Mail, Phone,
    RefreshCw, IndianRupee, MapPin, Building,
    Calendar, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import gsap from 'gsap';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        gst_number: '',
        pan_number: '',
        address: '',
        city: '',
        state: '',
        credit_period_days: 30,
        status: 'active',
        total_purchase_amount: 0,
        outstanding_payable_amount: 0
    });

    const containerRef = useRef(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                ".vendor-row-anim",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [loading, searchTerm]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/suppliers.php');
            if (res.data.success) {
                setVendors(res.data.data);
            } else {
                toast.error('Failed to fetch vendors');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while fetching vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({
                id: vendor.id,
                supplier_name: vendor.supplier_name,
                contact_person: vendor.contact_person || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                gst_number: vendor.gst_number || '',
                pan_number: vendor.pan_number || '',
                address: vendor.address || '',
                city: vendor.city || '',
                state: vendor.state || '',
                credit_period_days: vendor.credit_period_days || 30,
                status: vendor.status || 'active',
                total_purchase_amount: vendor.total_purchase_amount || 0,
                outstanding_payable_amount: vendor.outstanding_payable_amount || 0
            });
        } else {
            setEditingVendor(null);
            setFormData({
                supplier_name: '',
                contact_person: '',
                phone: '',
                email: '',
                gst_number: '',
                pan_number: '',
                address: '',
                city: '',
                state: '',
                credit_period_days: 30,
                status: 'active',
                total_purchase_amount: 0,
                outstanding_payable_amount: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingVendor ? 'Updating vendor...' : 'Adding vendor...');

        try {
            let res;
            if (editingVendor) {
                res = await axios.put('http://localhost/sales_manage/backend/api/suppliers.php', formData);
            } else {
                res = await axios.post('http://localhost/sales_manage/backend/api/suppliers.php', formData);
            }

            if (res.data.success) {
                toast.success(res.data.message, { id: loadingToast });
                handleCloseModal();
                fetchVendors();
            } else {
                toast.error(res.data.error || 'Action failed', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error', { id: loadingToast });
        }
    };

    const handleDeleteVendor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vendor? This might affect bill histories.')) return;

        const loadingToast = toast.loading('Deleting vendor...');
        try {
            const res = await axios.delete(`http://localhost/sales_manage/backend/api/suppliers.php?id=${id}`);
            if (res.data.success) {
                toast.success('Vendor deleted', { id: loadingToast });
                fetchVendors();
            } else {
                toast.error(res.data.error, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete', { id: loadingToast });
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredVendors = vendors.filter(v => {
        const term = searchTerm.toLowerCase();
        return (
            v.supplier_name.toLowerCase().includes(term) ||
            v.id.toString().includes(term) ||
            (v.phone && v.phone.includes(term))
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

    return (
        <div className="vendor-mgmt-container" ref={containerRef}>
            <SEO title="Vendor Management | Admin" description="Track supplier transactions and manage vendor details." />

            <div className="page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                            <Truck size={32} />
                        </div>
                        Vendor Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage suppliers, purchase history and payables.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchVendors}
                        className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="erp-button erp-button-primary"
                    >
                        <UserPlus size={18} />
                        <span>Add New Vendor</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6 flex items-center gap-5">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><Building size={28} /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Suppliers</p>
                        <h2 className="text-2xl font-bold text-white">{vendors.length}</h2>
                    </div>
                </div>
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6 flex items-center gap-5">
                    <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl"><IndianRupee size={28} /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Purchases</p>
                        <h2 className="text-2xl font-bold text-white">₹{vendors.reduce((acc, v) => acc + parseFloat(v.total_purchase_amount || 0), 0).toLocaleString()}</h2>
                    </div>
                </div>
                <div className="erp-card bg-slate-900/40 border-slate-700/50 p-6 flex items-center gap-5 border-l-4 border-l-red-500">
                    <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl"><IndianRupee size={28} /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Payable</p>
                        <h2 className="text-2xl font-bold text-red-500">₹{vendors.reduce((acc, v) => acc + parseFloat(v.outstanding_payable_amount || 0), 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <div className="flex mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Vendor Name, ID, or Contact..."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-300 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Vendor Details</th>
                            <th className="px-6 py-4">Contact Person</th>
                            <th className="px-6 py-4">GST Number</th>
                            <th className="px-6 py-4">Payable Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse px-6 py-4 bg-slate-800/20 h-16 w-full"></tr>)
                        ) : currentItems.length > 0 ? (
                            currentItems.map(vendor => (
                                <tr key={vendor.id} className="vendor-row-anim hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">#V-{vendor.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white text-base">{vendor.supplier_name}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Phone size={10} /> {vendor.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">{vendor.contact_person || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm font-semibold">{vendor.gst_number || 'N/A'}</td>
                                    <td className="px-6 py-4 font-bold text-red-400 text-base">₹{parseFloat(vendor.outstanding_payable_amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${vendor.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(vendor)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-all"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteVendor(vendor.id)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">No vendors found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setCurrentPage(n)} className={`w-10 h-10 rounded-xl font-bold ${currentPage === n ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>{n}</button>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleCloseModal} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-3xl shadow-2xl z-20 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-800 flex justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                                    <p className="text-slate-400 text-xs">Fill in supplier details for transaction tracking.</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Vendor Name *</label>
                                        <input name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Contact Person</label>
                                        <input name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Mobile</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Email</label>
                                        <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">GST Number</label>
                                        <input name="gst_number" value={formData.gst_number} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Payment Terms (Days)</label>
                                        <input type="number" name="credit_period_days" value={formData.credit_period_days} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Total Purchase (₹)</label>
                                        <input type="number" name="total_purchase_amount" value={formData.total_purchase_amount} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Outstanding Payable (₹)</label>
                                        <input type="number" name="outstanding_payable_amount" value={formData.outstanding_payable_amount} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white text-red-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white resize-none" rows="2"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">City</label>
                                        <input name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-white">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2">
                                        <Save size={20} />
                                        {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .erp-button {
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
                    border-radius: 1rem; font-weight: 700; transition: all 0.2s ease;
                }
                .erp-button-primary { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
                .erp-button-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
            `}</style>
        </div>
    );
};

export default VendorManagement;
