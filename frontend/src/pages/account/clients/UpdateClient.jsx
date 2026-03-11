import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search, Edit, ArrowLeft, Save, X,
    Building2, User, MapPin, FileText, Phone, Mail, Briefcase, Users
} from 'lucide-react';

const UpdateClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeFormTab, setActiveFormTab] = useState('personal');

    // Form State
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (location.state && location.state.client) {
            handleSelect(location.state.client);
        }
    }, [location.state]);

    const fetchClients = async () => {
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/clients.php');
            setClients(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSelect = (client) => {
        setSelectedClient(client);
        setActiveFormTab('personal');
        setFormData({
            id: client.id,
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            customer_type: client.customer_type || 'Regular',
            shop_name: client.shop_name || '',
            company: client.company || '',
            website: client.website || '',
            contact_person: client.contact_person || '',
            address: client.address || '',
            area: client.area || '',
            city: client.city || '',
            state: client.state || '',
            pincode: client.pincode || '',
            billing_address: client.billing_address || '',
            shipping_address: client.shipping_address || '',
            gstin: client.gstin || '',
            pan: client.pan || '',
            credit_limit: client.credit_limit || '',
            notes: client.notes || '',
            bank_name: client.bank_name || '',
            account_number: client.account_number || '',
            ifsc_code: client.ifsc_code || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Fallbacks for addresses if empty
                billing_address: formData.billing_address || formData.address,
                shipping_address: formData.shipping_address || formData.address
            };
            const res = await axios.put('http://localhost/sales_manage/backend/api/clients.php', payload);
            if (res.data.success) {
                alert("Client Updated Successfully!");
                setSelectedClient(null);
                fetchClients();
                // Optionally navigate back or stay to edit more
                if (location.state) navigate('/clients');
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Update Failed");
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.shop_name && c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-16">
            <header className="page-header mb-8">
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium" onClick={() => navigate('/clients')}>
                    <ArrowLeft size={16} /> Back to List
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Edit size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white m-0 tracking-tight">Update Client</h1>
                        <p className="text-slate-400 mt-1">Search for a client and update their details.</p>
                    </div>
                </div>
            </header>

            {!selectedClient ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="erp-card p-4 relative z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search clients by name, phone, or shop..."
                                className="erp-input pl-12 w-full border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredClients.map((client, index) => (
                                    <motion.div
                                        key={client.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleSelect(client)}
                                        className="erp-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xl shrink-0 group-hover:scale-110 shadow-lg shadow-indigo-500/20 transition-all">
                                                {client.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg m-0 group-hover:text-blue-300 transition-colors">{client.name}</h4>
                                                <p className="text-slate-400 text-sm m-0 mt-0.5">{client.shop_name || client.company || client.phone}</p>
                                            </div>
                                        </div>
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-all font-semibold pointer-events-none">
                                            Select <Edit size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                        {filteredClients.length === 0 && !loading && (
                            <div className="text-center p-12 erp-card border-white/5 border-dashed">
                                <Users className="mx-auto text-slate-600 mb-4" size={48} />
                                <h3 className="text-white text-lg font-bold">No clients found</h3>
                                <p className="text-slate-400">"{searchTerm}" didn't match any clients.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="erp-card p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                        <h3 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                <Edit size={20} />
                            </span>
                            Editing: {selectedClient.name}
                        </h3>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg border border-slate-700 transition-colors font-medium text-sm w-fit"
                            onClick={() => setSelectedClient(null)}
                        >
                            <X size={16} /> Cancel Editing
                        </button>
                    </div>

                    <div className="flex overflow-x-auto gap-2 mb-8 pb-4 border-b border-white/10 hide-scrollbar">
                        {[
                            { id: 'personal', label: 'Personal', icon: User },
                            { id: 'work', label: 'Business', icon: Briefcase },
                            { id: 'billing', label: 'Tax & Billing', icon: FileText },
                            { id: 'bank', label: 'Bank Details', icon: Building2 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-semibold transition-all ${activeFormTab === tab.id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent'
                                    }`}
                                onClick={() => setActiveFormTab(tab.id)}
                            >
                                <tab.icon size={18} className={activeFormTab === tab.id ? "text-white" : "text-slate-500"} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        {activeFormTab === 'personal' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name *</label>
                                        <input required className="erp-input w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Client Type</label>
                                        <div className="relative">
                                            <select
                                                className="erp-input w-full appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.8rem_center] bg-no-repeat pr-10"
                                                value={formData.customer_type}
                                                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                                            >
                                                <option className="bg-slate-800" value="Regular">Regular</option>
                                                <option className="bg-slate-800" value="VIP">VIP</option>
                                                <option className="bg-slate-800" value="Wholesale">Wholesale</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Phone *</label>
                                        <input required className="erp-input w-full" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email Focus</label>
                                        <input type="email" className="erp-input w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Address</label>
                                    <textarea rows="2" className="erp-input w-full resize-y" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Area</label>
                                        <input className="erp-input w-full" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="e.g. Malad" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">City</label>
                                        <input className="erp-input w-full" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">State</label>
                                        <input className="erp-input w-full" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Pincode</label>
                                        <input className="erp-input w-full" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Internal Notes</label>
                                    <textarea rows="3" className="erp-input w-full resize-y bg-slate-900/50" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any private notes here..." />
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'work' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Shop Name</label>
                                    <input className="erp-input w-full" value={formData.shop_name} onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Company Name</label>
                                        <input className="erp-input w-full" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">https://</span>
                                            <input className="erp-input w-full pl-[4.5rem]" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="www.example.com" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Person</label>
                                    <input className="erp-input w-full" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'billing' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
                                        <label className="block text-sm font-semibold text-blue-400 mb-2">GSTIN</label>
                                        <input className="erp-input w-full font-mono uppercase tracking-wider bg-slate-800" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
                                    </div>
                                    <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none"></div>
                                        <label className="block text-sm font-semibold text-purple-400 mb-2">PAN Number</label>
                                        <input className="erp-input w-full font-mono uppercase tracking-wider bg-slate-800" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} placeholder="ABCDE1234F" />
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 pr-0 md:pr-3">
                                    <label className="block text-sm font-semibold text-emerald-400 mb-2">Credit Limit (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <input type="number" className="erp-input w-full pl-8 font-mono text-lg" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Billing Address</label>
                                        <textarea rows="3" className="erp-input w-full resize-y" value={formData.billing_address} onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })} placeholder="Leave empty to use primary address" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Shipping Address</label>
                                        <textarea rows="3" className="erp-input w-full resize-y" value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} placeholder="Leave empty to use billing address" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeFormTab === 'bank' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Bank Name</label>
                                        <input className="erp-input w-full" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="e.g. HDFC Bank, State Bank of India" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Account Number</label>
                                            <input className="erp-input w-full font-mono tracking-wider" value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">IFSC Code</label>
                                            <input className="erp-input w-full font-mono uppercase tracking-wider" value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} placeholder="SBIN0001234" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-8 mt-8 border-t border-white/10 flex justify-end">
                            <button type="submit" className="erp-button erp-button-primary shadow-lg shadow-blue-500/30 flex items-center gap-2 px-8">
                                <Save size={18} /> Update Client Details
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default UpdateClient;
