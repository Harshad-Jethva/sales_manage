import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, FileText, Download, Eye, X, Printer, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import InvoiceTemplate from '../../components/pos/InvoiceTemplate';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

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
    const containerRef = useRef(null);

    useEffect(() => {
        fetchBills();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.history-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [loading, searchTerm, startDate, endDate]);

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
        <div className="animate-fade-in flex flex-col h-full" ref={containerRef}>
            <SEO title="Transaction History" description="Review past billing and accounting records." />
            {/* Header */}
            <header className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 history-anim-el">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <FileText className="text-primary hidden sm:block" size={28} />
                        Transactions History
                    </h1>
                    <p className="page-subtitle">Review all past billing and accounting records globally.</p>
                </div>
                <button className="erp-button erp-button-primary shadow-lg">
                    <Download size={18} /> <span>Export CSV</span>
                </button>
            </header>

            {/* Filters */}
            <div className="erp-card mb-6 py-4 px-5 flex flex-wrap gap-6 items-end history-anim-el">
                <div className="flex-1 min-w-[250px]">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Records</label>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Invoice No, Customer, or Type..."
                            className="erp-input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                        type="date"
                        className="erp-input w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                    <input
                        type="date"
                        className="erp-input w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Global Info Bar */}
            <div className="erp-grid erp-grid-cards mb-6 history-anim-el">
                <div className="erp-card p-5 flex items-center gap-4 border-l-4 border-indigo-500/50">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-secondary text-sm font-semibold mb-1 uppercase tracking-wider">Total Records</h3>
                        <h2 className="text-white text-2xl font-bold">{filteredBills.length}</h2>
                    </div>
                </div>

                <div className="erp-card p-5 flex items-center gap-4 border-l-4 border-emerald-500/50">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-secondary text-sm font-semibold mb-1 uppercase tracking-wider">Gross Sum Total</h3>
                        <h2 className="text-emerald-400 text-2xl font-bold font-mono">₹{totalSales.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="erp-card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-secondary text-sm font-semibold mb-1 uppercase tracking-wider">Total Collected</h3>
                        <h2 className="text-white text-2xl font-bold font-mono">₹{totalCollected.toFixed(2)}</h2>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="erp-card flex-1 overflow-hidden flex flex-col min-h-[400px] history-anim-el">
                <div className="erp-table-container custom-scrollbar">
                    <table className="erp-table">
                        <thead className="sticky top-0 z-10 bg-surface-hover/95 backdrop-blur-md">
                            <tr>
                                <th>Date</th>
                                <th>Bill No</th>
                                <th>Type</th>
                                <th>Client Details</th>
                                <th className="text-right">Total</th>
                                <th className="text-right">Paid</th>
                                <th className="text-center">Method</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-12 text-slate-500">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        Loading transaction vault...
                                    </td>
                                </tr>
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-12 text-slate-500">
                                        <FileText className="mx-auto mb-3 opacity-20" size={40} />
                                        <p>No records found matching these filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map((bill, index) => {
                                    const isPaid = bill.status === 'paid';
                                    const isPartial = bill.status === 'partial';

                                    return (
                                        <tr
                                            key={bill.id || index}
                                            onClick={() => handleViewBill(bill.id)}
                                            className="hover:bg-surface-hover/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="font-mono text-slate-300">
                                                <div className="text-sm">{bill.bill_date}</div>
                                                {bill.created_at && (
                                                    <div className="text-[10px] text-slate-500 mt-1">
                                                        {new Date(bill.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="font-bold text-white tracking-wide">{bill.bill_number}</td>
                                            <td>
                                                <span className={`erp-badge ${bill.bill_type === 'sale' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'badge-warning'}`}>
                                                    {bill.bill_type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="font-medium text-slate-200">{bill.customer_name || bill.supplier_name || 'Walk-in / Cash Customer'}</div>
                                                {bill.shop_name && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                                                        {bill.shop_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-right font-mono font-bold text-white text-[15px]">₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                                            <td className="text-right font-mono text-emerald-400 text-[15px]">₹{parseFloat(bill.paid_amount).toFixed(2)}</td>
                                            <td className="text-center">
                                                <span className="text-xs px-2 py-1 bg-slate-800/80 rounded border border-slate-700 text-slate-300 shadow-sm">{bill.payment_method || '-'}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`erp-badge ${isPaid ? 'badge-success' : isPartial ? 'badge-warning' : 'badge-danger'}`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewBill(bill.id); }}
                                                    className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors group-hover:scale-110"
                                                    title="View & Print Bill"
                                                >
                                                    {loadingBill && selectedBill?.billNo === bill.bill_number ? <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" /> : <Eye size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
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
        </div>
    );
};

export default BillHistory;
