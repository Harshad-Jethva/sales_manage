import React, { useState, useEffect } from 'react';
import { Search, Calendar, FileText, Download, Eye, X, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import InvoiceTemplate from '../components/pos/InvoiceTemplate';

const BillHistory = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedBill, setSelectedBill] = useState(null);
    const [loadingBill, setLoadingBill] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/bills.php');
            if (Array.isArray(res.data)) {
                setBills(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch bills', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBill = async (id) => {
        setLoadingBill(true);
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/bills.php?id=${id}`);
            const b = res.data;
            const formattedBill = {
                billNo: b.bill_number,
                billDate: b.bill_date,
                created_at: b.created_at, // useful for precise time
                selectedClient: {
                    name: b.customer_name,
                    gstin: b.customer_gstin,
                    phone: b.customer_phone,
                    address: b.customer_address,
                    city: b.customer_city,
                    shop_name: b.shop_name
                },
                cart: Array.isArray(b.items) ? b.items.map(i => ({
                    id: i.product_id,
                    name: i.item_name,
                    sku: i.item_code,
                    qty: i.quantity,
                    price: parseFloat(i.mrp || i.price_after_discount),
                    gst_percent: parseFloat(i.gst_percent),
                    discountPercent: parseFloat(i.regular_discount_percent) + parseFloat(i.special_discount_percent || 0),
                    total: parseFloat(i.total)
                })) : [],
                subTotal: parseFloat(b.sub_total),
                discountAmount: parseFloat(b.discount_amount),
                taxTotal: parseFloat(b.tax_amount),
                finalTotal: parseFloat(b.total_amount),
                paidAmount: parseFloat(b.paid_amount),
                method: b.payment_method,
            };
            setSelectedBill(formattedBill);
        } catch (e) {
            console.error('Failed to view invoice details', e);
        } finally {
            setLoadingBill(false);
        }
    };

    // Filter Logic
    const filteredBills = bills.filter(bill => {
        if (bill.bill_type !== 'sale') return false; // STRICT: Only display Sale Bills

        const d = bill.bill_date.split(' ')[0]; // Handle timestamp format
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const numMatch = bill.bill_number?.toLowerCase().includes(term);
            const nameMatch = bill.customer_name?.toLowerCase().includes(term);
            const typeMatch = bill.bill_type?.toLowerCase().includes(term);
            if (!numMatch && !nameMatch && !typeMatch) return false;
        }
        return true;
    });

    const totalSales = filteredBills.reduce((acc, bill) => acc + parseFloat(bill.total_amount || 0), 0);
    const totalCollected = filteredBills.reduce((acc, bill) => acc + parseFloat(bill.paid_amount || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-xl"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-800/50">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-indigo-400" size={28} />
                        Transactions History
                    </h1>
                    <p className="text-slate-400 mt-1">Review all past billing and accounting records globally.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-white flex gap-2 items-center transition-all shadow-lg shadow-indigo-500/25">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-white/10 bg-slate-900/80 flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[250px]">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Search Records</label>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by Invoice No, Customer, or Type..."
                            className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Start Date</label>
                    <input
                        type="date"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">End Date</label>
                    <input
                        type="date"
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Global Info Bar */}
            <div className="px-6 py-4 flex flex-wrap justify-between items-center bg-indigo-900/20 border-b border-indigo-500/20">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Records</span>
                        <span className="text-lg font-bold text-white">{filteredBills.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Gross Sum Total</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">₹{totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Collected</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">₹{totalCollected.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap text-slate-300">
                    <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Date</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Bill No</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Type</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider">Customer / Supplier</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-right">Total</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-right">Paid</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-center">Method</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-center">Status</th>
                            <th className="p-4 font-bold uppercase text-xs text-slate-400 tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="text-center p-12 text-slate-500 text-lg">Loading transaction vault...</td>
                            </tr>
                        ) : filteredBills.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center p-12 text-slate-500 text-lg flex flex-col items-center justify-center">
                                    <FileText className="mb-3 opacity-50" size={40} />
                                    No records found matching these filters.
                                </td>
                            </tr>
                        ) : (
                            filteredBills.map((bill, index) => (
                                <tr
                                    key={bill.id || index}
                                    onClick={() => handleViewBill(bill.id)}
                                    className="hover:bg-slate-700/80 cursor-pointer border-b border-white/5 transition-colors group"
                                >
                                    <td className="p-4 font-mono">
                                        <div className="text-sm">{bill.bill_date}</div>
                                        {bill.created_at && (
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {new Date(bill.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-white tracking-wide">{bill.bill_number}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold shadow-sm ${bill.bill_type === 'sale' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                                            {bill.bill_type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-200">{bill.customer_name || bill.supplier_name || 'Walk-in / Cash Customer'}</div>
                                        {bill.shop_name && (
                                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                                                {bill.shop_name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-white text-[15px]">₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                                    <td className="p-4 text-right font-mono text-emerald-400 text-[15px]">₹{parseFloat(bill.paid_amount).toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 shadow-sm">{bill.payment_method || '-'}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold shadow-sm ${bill.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            bill.status === 'partial' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleViewBill(bill.id)} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors group-hover:scale-105" title="View & Print Bill">
                                            {loadingBill && selectedBill?.billNo === bill.bill_number ? <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" /> : <Eye size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

            {/* Modal Viewer */}
            <AnimatePresence>
                {selectedBill && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-[90vw] max-w-[800px] rounded-xl shadow-2xl flex flex-col h-[95vh] overflow-hidden border border-gray-200 relative"
                        >
                            <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0 print:hidden">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                    <FileText className="text-indigo-600" /> Bill Inspector: <span className="text-indigo-600">{selectedBill.billNo}</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => {
                                        setTimeout(() => window.print(), 200);
                                    }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                                        <Download size={16} /> Download / Print Bill
                                    </button>
                                    <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:bg-red-50 hover:text-red-500 p-2 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Overflow container */}
                            <div className="flex-1 overflow-auto bg-gray-200 p-2 md:p-6 print:p-0 print:bg-white custom-scrollbar history-print-zone">
                                <div className="shadow-lg bg-white mx-auto relative rounded-md overflow-hidden print:shadow-none print:w-full">
                                    {/* Re-use Invoice Template */}
                                    <InvoiceTemplate bill={selectedBill} isHistoryView={true} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Print Styles for targeting just the modal */}
            <style type="text/css">{`
                @media print {
                    body > *:not(.history-print-zone) {
                        display: none !important;
                    }
                    .history-print-zone {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        height: 100% !important;
                        overflow: visible !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #history-invoice {
                        height: 99vh !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default BillHistory;
