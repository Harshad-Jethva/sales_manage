import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Phone, Mail, MapPin, Globe, Building2,
    FileText, CreditCard, Edit, Trash2, Printer, Share2,
    Calendar, TrendingUp, DollarSign, Award, Receipt
} from 'lucide-react';

const ClientProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [bills, setBills] = useState([]);
    const [loadingBills, setLoadingBills] = useState(false);

    useEffect(() => {
        if (location.state && location.state.client) {
            setClient(location.state.client);
            fetchClientBills(location.state.client.id);
        } else {
            navigate(-1);
        }
    }, [location.state, navigate]);

    const fetchClientBills = async (clientId) => {
        setLoadingBills(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/bills.php?customer_id=${clientId}`);
            setBills(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching bills:", err);
        } finally {
            setLoadingBills(false);
        }
    };

    if (!client) return null;

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    // Helper to format date
    const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="animate-fade-in min-h-screen pb-16 relative">
            {/* ================= PRINT REPORT LAYOUT ================= */}
            <div className="print-report-container hidden print:block bg-white text-black p-10 absolute inset-0 min-h-screen">
                <style type="text/css" media="print">{`
                    @page { margin: 10mm; size: A4; }
                    html, body {
                        height: 100%; margin: 0; padding: 0; overflow: hidden; background: #fff !important; color: #000 !important;
                    }
                    #root, .app-container, .main-content, .sidebar, header, nav { 
                        display: block !important; position: static !important; width: 100% !important; margin: 0 !important; padding: 0 !important;
                    }
                    .hide-on-print { display: none !important; height: 0 !important; width: 0 !important; }
                    .print-report-container { display: block !important; position: absolute; top:0; left:0; width: 100%; font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; z-index: 9999; }
                `}</style>
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">CLIENT PROFILE RECORD</h1>
                    <div className="text-sm flex justify-between max-w-2xl mx-auto">
                        <span><strong>Generated:</strong> {formattedDate}</span>
                        <span><strong>Client ID:</strong> #{client.id?.toString().padStart(4, '0')}</span>
                    </div>
                </div>

                <div className="mb-6 page-break-inside-avoid">
                    <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1">1. CLIENT IDENTITY</h2>
                    <div className="flex justify-between">
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Full Name:</span> {client.name}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Status:</span> {client.customer_type || 'Active'}</div>
                        </div>
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Credit Limit:</span> ₹{client.credit_limit || '0.00'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Location:</span> {client.city}, {client.state}</div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-black opacity-30 my-6"></div>

                <div className="mb-6 page-break-inside-avoid">
                    <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1">2. CONTACT & BUSINESS</h2>
                    <div className="flex justify-between">
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Company:</span> {client.company || '-'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Shop Name:</span> {client.shop_name || '-'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Contact Person:</span> {client.contact_person || '-'}</div>
                        </div>
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Mobile:</span> {client.phone}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Email:</span> {client.email || '-'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Website:</span> {client.website || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-black opacity-30 my-6"></div>

                <div className="mb-6 page-break-inside-avoid">
                    <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1">3. BILLING & TAXATION</h2>
                    <div className="flex justify-between">
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">GSTIN:</span> {client.gstin || 'N/A'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">PAN:</span> {client.pan || 'N/A'}</div>
                        </div>
                        <div className="w-[48%]">
                            <div className="text-sm font-bold mb-1">Billing Address:</div>
                            <div className="text-sm">{client.billing_address || client.address || '-'}</div>
                            <div className="text-sm">{client.city} {client.state} {client.pincode}</div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-black opacity-30 my-6"></div>

                <div className="mb-6 page-break-inside-avoid">
                    <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1">4. BANKING DETAILS</h2>
                    <div className="flex justify-between">
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Bank Name:</span> {client.bank_name || '-'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">Account Name:</span> {client.name.toUpperCase()}</div>
                        </div>
                        <div className="w-[48%] space-y-2">
                            <div className="text-sm"><span className="font-bold inline-block w-32">Account Number:</span> {client.account_number || '-'}</div>
                            <div className="text-sm"><span className="font-bold inline-block w-32">IFSC Code:</span> {client.ifsc_code || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 page-break-inside-avoid">
                    <h2 className="text-lg font-bold uppercase border-b border-black mb-3 pb-1">INTERNAL NOTES</h2>
                    <div className="border border-black p-4 min-h-[100px] text-sm">
                        {client.notes || 'No internal notes recorded.'}
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 w-full text-center text-xs border-t border-black pt-2 bg-white pb-4">
                    <p>This document is a confidential business record.</p>
                </div>
            </div>
            {/* ================= END PRINT LAYOUT ================= */}


            <div className="hide-on-print">
                {/* HERO BANNER (Screen Only) */}
                <div className="relative h-64 -mx-[1.5rem] -mt-[1.5rem] mb-12 overflow-hidden bg-slate-900 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.1)_0%,transparent_50%))]"></div>
                    <div className="max-w-6xl mx-auto h-full px-6 flex justify-between items-start pt-6 relative z-10">
                        <button className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/10 text-slate-300 rounded-lg hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-medium text-sm" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="flex gap-3">
                            <button className="flex items-center justify-center p-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/15 hover:border-white/30 transition-all" title="Share"><Share2 size={18} /></button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/15 hover:border-white/30 transition-all text-sm font-semibold" onClick={() => window.print()}><Printer size={16} /> Print Report</button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-white hover:border-red-500 transition-all text-sm font-semibold" onClick={() => navigate('/clients/delete', { state: { client } })}>
                                <Trash2 size={16} /> Delete
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] text-white rounded-lg transition-all text-sm font-semibold" onClick={() => navigate('/clients/update', { state: { client } })}>
                                <Edit size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CONTAINER (Screen Only) */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20">
                    {/* HEADLINE SECTION */}
                    <div className="erp-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center md:items-start lg:items-center gap-6 mb-8 -mt-32 shadow-2xl border-white/10 backdrop-blur-xl bg-slate-800/80">
                        <div className="flex gap-6 items-center w-full md:w-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/30 shrink-0">
                                    {getInitials(client.name)}
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xl font-bold text-slate-300 tracking-wider shrink-0" title="Client ID">
                                    #{client.id.toString().padStart(4, '0')}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h1 className="text-3xl font-bold text-white m-0">{client.name}</h1>
                                    <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-600">
                                        {client.customer_type}
                                    </span>
                                </div>
                                <p className="text-slate-400 font-medium text-base mb-2">
                                    {client.shop_name || client.company || 'Individual Client'} • {client.city || 'Location N/A'}
                                </p>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                    <Calendar size={14} /> ID: #{client.id.toString().padStart(4, '0')}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex gap-10 md:text-right border-l border-white/10 pl-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Outstanding</label>
                                <h4 className="text-2xl font-bold text-red-500 m-0">₹{parseFloat(client.outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Credit Limit</label>
                                <h4 className="text-2xl font-bold text-white m-0">₹{parseFloat(client.credit_limit || 0).toLocaleString()}</h4>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
                                <h4 className="text-2xl font-bold text-emerald-400 m-0">Active</h4>
                            </div>
                        </div>
                        {/* Mobile right col equivalent */}
                        <div className="md:hidden flex w-full justify-between items-center border-t border-white/10 pt-4 mt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Outstanding</label>
                                <h4 className="text-xl font-bold text-red-500 m-0">₹{parseFloat(client.outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            </div>
                            <div className="text-right">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Credit Limit</label>
                                <h4 className="text-xl font-bold text-white m-0">₹{parseFloat(client.credit_limit || 0).toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>

                    {/* TWO COLUMN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="space-y-8">
                            <div className="erp-card p-6 border-white/5">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">
                                    <Phone className="text-indigo-400" size={20} /> Contact Information
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 text-lg border border-white/5"><Phone size={18} /></div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Mobile Number</label>
                                            <p className="text-slate-200 font-semibold m-0">{client.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 text-lg border border-white/5"><Mail size={18} /></div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Email Address</label>
                                            <p className="text-slate-200 font-semibold m-0">{client.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 text-lg border border-white/5"><Globe size={18} /></div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Website</label>
                                            <p className="text-slate-200 font-semibold m-0">{client.website || 'No website link'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="erp-card p-6 border-white/5">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">
                                    <MapPin className="text-indigo-400" size={20} /> Address Details
                                </h3>

                                <div className="mb-5 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billing Address</h5>
                                    <p className="text-slate-300 m-0 mb-1">{client.billing_address || client.address}</p>
                                    <p className="text-slate-300 m-0">{client.city} {client.state} {client.pincode}</p>
                                </div>

                                <div className="h-px bg-white/5 mx-2 my-5"></div>

                                <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Shipping Address</h5>
                                    <p className="text-slate-300 m-0">{client.shipping_address || client.billing_address || "Same as Billing"}</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-8">
                            <div className="erp-card p-6 border-white/5">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">
                                    <Building2 className="text-indigo-400" size={20} /> Business Profile
                                </h3>
                                <div className="grid grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
                                        <p className="text-slate-200 font-semibold m-0">{client.company || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Shop Name</label>
                                        <p className="text-slate-200 font-semibold m-0">{client.shop_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Contact Person</label>
                                        <p className="text-slate-200 font-semibold m-0">{client.contact_person || 'Self'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Business Type</label>
                                        <p className="text-slate-200 font-semibold m-0">Retail / Wholesale</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-5 rounded-xl border-l-4 border-indigo-500 border-t border-r border-b border-y-white/5 border-r-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-slate-400 text-sm font-medium">GSTIN</span>
                                        <strong className="text-white text-sm font-mono tracking-wider">{client.gstin || 'UNREGISTERED'}</strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm font-medium">PAN Number</span>
                                        <strong className="text-white text-sm font-mono tracking-wider">{client.pan || 'N/A'}</strong>
                                    </div>
                                </div>
                            </div>

                            {client.bank_name && (
                                <div className="erp-card p-6 border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden shadow-xl">
                                    {/* decorative glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>

                                    <div className="w-12 h-8 rounded-md bg-gradient-to-br from-[#fceabb] to-[#f8b500] opacity-90 mb-6 shadow-sm"></div>
                                    <div className="text-lg font-bold tracking-widest text-white mb-2">{client.bank_name}</div>
                                    <div className="font-mono text-xl md:text-2xl text-slate-300 tracking-[0.2em] mb-6">
                                        **** **** **** {client.account_number ? client.account_number.slice(-4) : '0000'}
                                    </div>
                                    <div className="flex justify-between flex-wrap gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC Code</label>
                                            <span className="text-slate-200 text-sm font-semibold">{client.ifsc_code}</span>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Holder</label>
                                            <span className="text-slate-200 text-sm font-semibold tracking-wider">{client.name.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="erp-card p-6 border-white/5">
                                <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-4 border-b border-white/5 pb-3">
                                    <FileText className="text-indigo-400" size={20} /> Internal Notes
                                </h3>
                                <p className="text-slate-400 italic text-sm leading-relaxed m-0 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                    {client.notes || 'No notes added for this client.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BILLING HISTORY SECTION */}
                    <div className="mt-8 erp-card p-6 border-white/5 shadow-2xl">
                        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-6 border-b border-white/5 pb-3">
                            <Receipt className="text-indigo-400" size={24} /> Billing & Payment History
                        </h3>
                        {loadingBills ? (
                            <div className="p-8 text-center text-slate-500 animate-pulse">Loading billing details...</div>
                        ) : bills.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-white/5">
                                No billing records found for this client.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/80 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                                            <th className="p-4 font-semibold">Date</th>
                                            <th className="p-4 font-semibold">Bill No</th>
                                            <th className="p-4 font-semibold text-right">Bill Amount</th>
                                            <th className="p-4 font-semibold text-right">Paid Amount</th>
                                            <th className="p-4 font-semibold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50 text-sm">
                                        {bills.map((bill) => (
                                            <tr key={bill.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 text-slate-300">
                                                    {bill.bill_date}
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-indigo-400 font-semibold">{bill.bill_number}</span>
                                                </td>
                                                <td className="p-4 text-right font-semibold text-white">
                                                    ₹{parseFloat(bill.total_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="p-4 text-right font-medium text-emerald-400">
                                                    ₹{parseFloat(bill.paid_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        bill.status === 'partial' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        }`}>
                                                        {bill.status ? bill.status.toUpperCase() : 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientProfile;
