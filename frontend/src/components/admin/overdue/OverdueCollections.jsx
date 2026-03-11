import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CalendarDays, DollarSign, Wallet, Phone, ArrowUpRight, CheckCircle2, AlertCircle, User, MapPin, Mail, Download, Printer, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateReceiptPDF } from './receiptGenerator';

const OverdueCollections = () => {
    const [overdueBills, setOverdueBills] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [amountRange, setAmountRange] = useState('');

    // Auto-complete Search State
    const [allClients, setAllClients] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedBill, setSelectedBill] = useState(null);
    const [collectionForm, setCollectionForm] = useState({
        collection_amount: '',
        payment_method: 'Cash',
        print_size: 'A4'
    });

    const [loadingPayment, setLoadingPayment] = useState(false);

    // Receipt Success Modal State
    const [successReceipt, setSuccessReceipt] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        fetchOverdueBills();
    }, [searchTerm, dateFilter, amountRange]);

    useEffect(() => {
        const fetchAllClients = async () => {
            try {
                const res = await fetch('http://localhost/sales_manage/backend/api/clients.php');
                const data = await res.json();
                if (data.success || data.status === 'success') {
                    setAllClients(data.data || []);
                }
            } catch (err) {
                console.error('Failed to load clients', err);
            }
        };
        fetchAllClients();
    }, []);

    const fetchOverdueBills = async () => {
        try {
            setLoading(true);
            const url = new URL('http://localhost/sales_manage/backend/api/overdue.php');
            url.searchParams.append('action', 'get_overdue');
            if (searchTerm) url.searchParams.append('search', searchTerm);
            if (dateFilter) url.searchParams.append('dateFilter', dateFilter);
            if (amountRange) url.searchParams.append('amountRange', amountRange);

            const res = await fetch(url);
            const result = await res.json();

            if (result.status === 'success') {
                setOverdueBills(result.data);
                setClientInfo(result.client_info || null);
            } else {
                toast.error(result.message || 'Failed to fetch overdue bills');
            }
        } catch (err) {
            toast.error('Network error while fetching bills.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectClick = (bill) => {
        setSelectedBill(bill);
        setCollectionForm({
            collection_amount: bill.overdue_amount,
            payment_method: 'Cash',
            print_size: 'A4'
        });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBill) return;

        if (parseFloat(collectionForm.collection_amount) > parseFloat(selectedBill.overdue_amount)) {
            toast.error("Collection amount cannot exceed overdue amount");
            return;
        }

        if (parseFloat(collectionForm.collection_amount) <= 0) {
            toast.error("Enter a valid amount");
            return;
        }

        try {
            setLoadingPayment(true);
            const res = await fetch('http://localhost/sales_manage/backend/api/overdue.php?action=collect_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bill_id: selectedBill.bill_id,
                    client_id: selectedBill.client_id,
                    collection_amount: collectionForm.collection_amount,
                    payment_method: collectionForm.payment_method
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message);

                // Generate PDF and Save to Backend
                const receiptData = data.receipt;
                const pdfDoc = await generateReceiptPDF(receiptData, collectionForm.print_size);

                // Extract clean base64
                const pdfDataUri = pdfDoc.output('datauristring');
                const pdfBase64 = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);

                const saveRes = await fetch('http://localhost/sales_manage/backend/api/overdue.php?action=save_receipt_pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        receipt_id: receiptData.receipt_id,
                        receipt_number: receiptData.receipt_number,
                        pdf_base64: pdfBase64
                    })
                });

                const saveResult = await saveRes.json();

                if (saveResult.status === 'success') {
                    receiptData.pdf_url = `http://localhost/sales_manage/backend/${saveResult.pdf_url}`;
                    setSuccessReceipt(receiptData);
                } else {
                    toast.error("Payment collected but failed to save PDF");
                }

                setSelectedBill(null);
                fetchOverdueBills();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to process payment");
            console.error(err);
        } finally {
            setLoadingPayment(false);
        }
    };

    const handlePrintAndDownload = async () => {
        if (!successReceipt) return;
        try {
            const pdfDoc = await generateReceiptPDF(successReceipt, 'A4');

            // Download
            pdfDoc.save(`${successReceipt.receipt_number || 'Receipt'}.pdf`);

            // Print
            const blobUrl = pdfDoc.output('bloburl');
            window.open(blobUrl, '_blank');

            toast.success("Receipt processed successfully!");
        } catch (error) {
            toast.error("Failed to generate receipt locally.");
            console.error(error);
        } finally {
            setSuccessReceipt(null);
        }
    };

    const handleWhatsAppSend = async () => {
        if (!successReceipt) return;

        try {
            setLoadingAction(true);
            const res = await fetch('http://localhost/sales_manage/backend/api/overdue.php?action=send_whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receipt_id: successReceipt.receipt_id })
            });

            const result = await res.json();
            if (result.status === 'success') {
                toast.success(result.message);
            } else {
                toast.error(result.message || "Failed to send WhatsApp");
            }
        } catch (error) {
            toast.error("Network error while sending WhatsApp");
        } finally {
            setLoadingAction(false);
            setSuccessReceipt(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-2xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                            <AlertCircle className="text-red-500" /> Overdue Collections
                        </h1>
                        <p className="text-slate-400">Track, manage and collect overdue credit bills</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                    <input
                        type="text"
                        placeholder="Search Client ID or Name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 relative z-10"
                    />

                    <AnimatePresence>
                        {showDropdown && searchTerm && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                            >
                                {allClients.filter(c =>
                                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    c.id.toString().includes(searchTerm) ||
                                    (c.phone && c.phone.includes(searchTerm))
                                ).map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => {
                                            setSearchTerm(client.id.toString());
                                            setShowDropdown(false);
                                        }}
                                        className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-700/50 last:border-0 flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{client.name}</span>
                                            <span className="text-xs text-slate-400">{client.phone || 'No Phone'} • {client.company || 'Individual'}</span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/20">
                                            ID: {client.id}
                                        </span>
                                    </div>
                                ))}
                                {allClients.filter(c =>
                                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    c.id.toString().includes(searchTerm) ||
                                    (c.phone && c.phone.includes(searchTerm))
                                ).length === 0 && (
                                        <div className="p-4 text-center text-slate-400 text-sm">No clients found matching "{searchTerm}"</div>
                                    )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                        value={amountRange}
                        onChange={(e) => setAmountRange(e.target.value)}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Amounts</option>
                        <option value="0-1000">₹0 - ₹1,000</option>
                        <option value="1000-5000">₹1,000 - ₹5,000</option>
                        <option value="5000-10000">₹5,000 - ₹10,000</option>
                        <option value="10000+">Above ₹10,000</option>
                    </select>
                </div>

                <button
                    onClick={() => { setSearchTerm(''); setDateFilter(''); setAmountRange(''); }}
                    className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 px-4 transition-colors font-medium flex items-center justify-center gap-2"
                >
                    <Filter className="w-4 h-4" /> Clear Filters
                </button>
            </div>

            {clientInfo && (
                <div className="mb-6 p-6 bg-[#1e293b] border border-indigo-500/20 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                                {clientInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2">
                                    {clientInfo.name}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">ID: {clientInfo.id}</span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {clientInfo.phone || 'N/A'}</span>
                                    {clientInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {clientInfo.email}</span>}
                                    {clientInfo.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" /> {clientInfo.address}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800/80 min-w-[240px]">
                            <div className="text-sm text-slate-400 mb-1">Total Outstanding</div>
                            <div className="text-3xl font-bold text-red-500">₹{parseFloat(clientInfo.outstanding_balance || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                                <span>Credit Limit:</span>
                                <span>₹{parseFloat(clientInfo.credit_limit || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0f172a] text-slate-300">
                            <tr>
                                <th className="p-4 rounded-tl-xl font-medium">Client Info</th>
                                <th className="p-4 font-medium">Bill Info</th>
                                <th className="p-4 font-medium">Overdue Amount</th>
                                <th className="p-4 font-medium">Due Date</th>
                                <th className="p-4 font-medium">Days Overdue</th>
                                <th className="p-4 rounded-tr-xl font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Loading overdue bills...</td>
                                </tr>
                            ) : overdueBills.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-3" />
                                        <p>No overdue bills found</p>
                                    </td>
                                </tr>
                            ) : (
                                overdueBills.map((bill) => (
                                    <tr key={bill.bill_id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{bill.client_name}</div>
                                            <div className="text-xs text-slate-400">ID: {bill.client_id}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Phone size={10} /> {bill.client_phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white text-sm">#{bill.bill_number}</div>
                                            <div className="text-xs text-slate-400 mt-1">Date: {bill.bill_date}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-red-400">₹{parseFloat(bill.overdue_amount).toLocaleString()}</div>
                                            <div className="text-xs text-slate-500">Total: ₹{parseFloat(bill.total_amount).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-300 text-sm whitespace-nowrap">{bill.due_date}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.days_overdue > 30 ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                                                bill.days_overdue > 15 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/20' :
                                                    'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {bill.days_overdue} days
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleCollectClick(bill)}
                                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <Wallet className="w-4 h-4" /> Collect
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Collection Modal */}
            <AnimatePresence>
                {selectedBill && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Wallet className="text-indigo-400" /> Collect Payment
                                </h3>
                                <button
                                    onClick={() => setSelectedBill(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="p-6">
                                <div className="mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-400">Client Info</span>
                                        <span className="font-medium text-white">{selectedBill.client_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-400">Bill Number</span>
                                        <span className="font-medium text-white">#{selectedBill.bill_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-red-400">Outstanding Balance</span>
                                        <span className="font-bold text-red-500 text-lg">₹{parseFloat(selectedBill.overdue_amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Collection Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            max={selectedBill.overdue_amount}
                                            value={collectionForm.collection_amount}
                                            onChange={(e) => setCollectionForm({ ...collectionForm, collection_amount: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-bold text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
                                        <select
                                            value={collectionForm.payment_method}
                                            onChange={(e) => setCollectionForm({ ...collectionForm, payment_method: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Receipt Print Size</label>
                                        <select
                                            value={collectionForm.print_size}
                                            onChange={(e) => setCollectionForm({ ...collectionForm, print_size: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="A4">A4 Invoice Size</option>
                                            <option value="A5">A5 Compact Size</option>
                                            <option value="Thermal">Thermal Printer (80mm)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBill(null)}
                                        className="flex-1 px-4 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loadingPayment}
                                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loadingPayment ? 'Processing...' : <><ArrowUpRight className="w-5 h-5" /> Submit Payment</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Receipt Modal */}
            <AnimatePresence>
                {successReceipt && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 text-center bg-gradient-to-b from-green-500/10 to-transparent">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Payment Collected!</h3>
                                <p className="text-slate-400">Receipt <span className="text-white font-medium">{successReceipt.receipt_number}</span> generated.</p>

                                <div className="mt-6 bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-400">Amount Collected</span>
                                        <span className="font-bold text-green-400">₹{parseFloat(successReceipt.collection_amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-400">Remaining Balance</span>
                                        <span className="font-medium text-white">₹{parseFloat(successReceipt.remaining_balance).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Client</span>
                                        <span className="font-medium text-white">{successReceipt.client_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <button
                                    onClick={handlePrintAndDownload}
                                    disabled={loadingAction}
                                    className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 px-4 transition-colors font-medium border border-slate-600"
                                >
                                    <Download size={20} /> Option 1: Save & Print
                                </button>

                                <button
                                    onClick={handleWhatsAppSend}
                                    disabled={loadingAction}
                                    className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 px-4 transition-colors font-medium"
                                >
                                    {loadingAction ? 'Sending...' : <><Send size={20} /> Option 2: Save & Send via WhatsApp</>}
                                </button>

                                <button
                                    onClick={() => setSuccessReceipt(null)}
                                    className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors mt-2"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OverdueCollections;
