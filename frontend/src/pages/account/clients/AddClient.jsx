import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    User,
    MapPin,
    FileText,
    Phone,
    Mail,
    CreditCard,
    Briefcase,
    Upload,
    Save,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';

const AddClient = () => {
    const navigate = useNavigate();
    const [activeFormTab, setActiveFormTab] = useState('personal'); // personal, work, billing, bank

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', customer_type: 'Regular',
        shop_name: '', company: '', website: '', contact_person: '',
        address: '', billing_address: '', shipping_address: '',
        city: '', state: '', pincode: '',
        gstin: '', pan: '', notes: '', credit_limit: '',
        bank_name: '', account_number: '', ifsc_code: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Fallbacks for addresses if empty
                billing_address: formData.billing_address || formData.address,
                shipping_address: formData.shipping_address || formData.address
            };

            const res = await axios.post('http://localhost/sales_manage/backend/api/clients.php', payload);

            if (res.data.success) {
                alert("Client Profile Created Successfully!");
                navigate('/clients'); // Redirect to list
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Submission Failed");
        }
    };

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <header className="page-header flex flex-col items-start gap-4">
                <button
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    onClick={() => navigate('/clients')}
                >
                    <ArrowLeft size={16} /> Back to Clients
                </button>
                <div>
                    <h1 className="page-title">Add New Client</h1>
                    <p className="page-subtitle mt-1">Create a comprehensive profile for a new customer or business partner.</p>
                </div>
            </header>

            <div className="erp-card flex-1 overflow-hidden flex flex-col mt-6 shadow-2xl border border-[rgba(255,255,255,0.05)]">
                <div className="flex border-b border-[rgba(255,255,255,0.05)] bg-slate-900/50 overflow-x-auto custom-scrollbar">
                    {['personal', 'work', 'billing', 'bank'].map(tab => (
                        <button
                            key={tab}
                            className={`px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap border-b-2 flex-1 text-center ${activeFormTab === tab
                                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                            onClick={() => setActiveFormTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* PHASE 1: PERSONAL */}
                    {activeFormTab === 'personal' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 text-lg font-bold text-white mb-6 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <User className="text-indigo-400" size={24} /> Personal Details
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name *</label>
                                    <input
                                        required
                                        className="erp-input w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Rahul Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Client Type</label>
                                    <select
                                        className="erp-input w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.8rem_center] bg-no-repeat pr-10"
                                        value={formData.customer_type}
                                        onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                                    >
                                        <option value="Regular" className="bg-slate-800">Regular</option>
                                        <option value="VIP" className="bg-slate-800">VIP</option>
                                        <option value="Wholesale" className="bg-slate-800">Wholesale</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Primary Phone *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={16} className="text-slate-500" />
                                        </div>
                                        <input
                                            required
                                            className="erp-input w-full pl-10"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={16} className="text-slate-500" />
                                        </div>
                                        <input
                                            type="email"
                                            className="erp-input w-full pl-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="client@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Primary Address</label>
                                <textarea
                                    rows="3"
                                    className="erp-input w-full resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full street address..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">City</label>
                                    <input className="erp-input w-full" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">State</label>
                                    <input className="erp-input w-full" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Pincode</label>
                                    <input className="erp-input w-full" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Internal Notes</label>
                                <textarea
                                    rows="2"
                                    className="erp-input w-full resize-none"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Specific requirements or remarks about the client..."
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                <button type="button" className="erp-button erp-button-primary px-6 py-2" onClick={() => {
                                    if (formData.name && formData.phone) setActiveFormTab('work');
                                    else alert('Please fill required fields (Name & Phone)');
                                }}>
                                    <span>Next Phase</span> <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: WORK */}
                    {activeFormTab === 'work' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 text-lg font-bold text-white mb-6 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <Briefcase className="text-indigo-400" size={24} /> Business Details
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Shop / Store Name</label>
                                <input
                                    className="erp-input w-full"
                                    value={formData.shop_name}
                                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                    placeholder="e.g. Laxmi General Store"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Legal Company Name</label>
                                    <input
                                        className="erp-input w-full"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="e.g. Laxmi Enterprises Pvt Ltd"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Website URL</label>
                                    <input
                                        className="erp-input w-full"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Contact Person (if distinct)</label>
                                <input
                                    className="erp-input w-full"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    placeholder="Manager Name"
                                />
                            </div>

                            <div className="flex justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                <button type="button" className="erp-button bg-transparent border border-white/20 hover:border-white hover:text-white" onClick={() => setActiveFormTab('personal')}>
                                    <ArrowLeft size={18} /> <span>Back</span>
                                </button>
                                <button type="button" className="erp-button erp-button-primary px-6 py-2" onClick={() => setActiveFormTab('billing')}>
                                    <span>Next Phase</span> <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 3: BILLING */}
                    {activeFormTab === 'billing' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 text-lg font-bold text-white mb-6 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <FileText className="text-indigo-400" size={24} /> Tax & Billing
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">GSTIN Number</label>
                                    <input
                                        className="erp-input w-full uppercase"
                                        value={formData.gstin}
                                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                        placeholder="22AAAAA0000A1Z5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">PAN Number</label>
                                    <input
                                        className="erp-input w-full uppercase"
                                        value={formData.pan}
                                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Credit Limit (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-bold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="erp-input w-full pl-10"
                                        value={formData.credit_limit}
                                        onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Billing Address</label>
                                    <textarea
                                        rows="3"
                                        className="erp-input w-full resize-none"
                                        value={formData.billing_address}
                                        onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                                        placeholder="Same as personal if empty"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Shipping Address</label>
                                    <textarea
                                        rows="3"
                                        className="erp-input w-full resize-none"
                                        value={formData.shipping_address}
                                        onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                        placeholder="Same as billing if empty"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                <button type="button" className="erp-button bg-transparent border border-white/20 hover:border-white hover:text-white" onClick={() => setActiveFormTab('work')}>
                                    <ArrowLeft size={18} /> <span>Back</span>
                                </button>
                                <button type="button" className="erp-button erp-button-primary px-6 py-2" onClick={() => setActiveFormTab('bank')}>
                                    <span>Next Phase</span> <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 4: BANK */}
                    {activeFormTab === 'bank' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 text-lg font-bold text-white mb-6 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <Building2 className="text-indigo-400" size={24} /> Bank Account Details
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Bank Name</label>
                                <input
                                    className="erp-input w-full"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    placeholder="e.g. HDFC Bank"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Account Number</label>
                                    <input
                                        className="erp-input w-full font-mono"
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        placeholder="0000000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">IFSC Code</label>
                                    <input
                                        className="erp-input w-full font-mono uppercase"
                                        value={formData.ifsc_code}
                                        onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                        placeholder="HDFC0001234"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                <button type="button" className="erp-button bg-transparent border border-white/20 hover:border-white hover:text-white" onClick={() => setActiveFormTab('billing')}>
                                    <ArrowLeft size={18} /> <span>Back</span>
                                </button>
                                <button type="submit" className="erp-button erp-button-primary shadow-lg px-8 py-3 text-base">
                                    <Save size={20} /> <span>Save Client Profile</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>

            <style type="text/css">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.8);
                }
            `}</style>
        </div>
    );
};

export default AddClient;
