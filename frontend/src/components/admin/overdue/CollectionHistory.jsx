import React, { useState, useEffect } from 'react';
import { Search, History, CheckCircle2, FileText, Download, Phone, Eye, Printer, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateReceiptPDF } from './receiptGenerator';

const CollectionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [searchTerm]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const url = new URL('http://localhost/sales_manage/backend/api/overdue.php');
            url.searchParams.append('action', 'get_history');
            if (searchTerm) url.searchParams.append('search', searchTerm);

            const res = await fetch(url);
            const result = await res.json();

            if (result.status === 'success') {
                setHistory(result.data);
            } else {
                toast.error(result.message || 'Failed to fetch collection history');
            }
        } catch (err) {
            toast.error('Network error while fetching history.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = async (receipt) => {
        try {
            const pdfDoc = await generateReceiptPDF(receipt, 'A4');
            const blobUrl = pdfDoc.output('bloburl');
            window.open(blobUrl, '_blank');
        } catch (err) {
            toast.error("Failed to generate PDF view.");
            console.error(err);
        }
    };

    const handleDownloadReceipt = async (receipt) => {
        try {
            const pdfDoc = await generateReceiptPDF(receipt, 'A4');
            pdfDoc.save(`${receipt.receipt_number || 'Receipt'}.pdf`);
            toast.success(`Started downloading ${receipt.receipt_number || 'Receipt'}`);
        } catch (error) {
            toast.error("Failed to download receipt.");
            console.error(error);
        }
    };

    const handlePrintReceipt = async (receipt) => {
        try {
            const pdfDoc = await generateReceiptPDF(receipt, 'A4');
            const blobUrl = pdfDoc.output('bloburl');
            const printWindow = window.open(blobUrl, '_blank');
            // Suggesting standard browser print dialog on load
            if (printWindow) {
                // We let the user use the browser's PDF viewer print button
                // as direct auto-printing blobs can be flaky across browsers
            }
        } catch (error) {
            toast.error("Failed to generate print view.");
            console.error(error);
        }
    };

    const handleSendWhatsApp = async (receiptId) => {
        try {
            setActionLoading(receiptId);
            const res = await fetch('http://localhost/sales_manage/backend/api/overdue.php?action=send_whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receipt_id: receiptId })
            });
            const result = await res.json();

            if (result.status === 'success') {
                toast.success(result.message);
                fetchHistory(); // Refresh to update status
            } else {
                toast.error(result.message || "Failed to send WhatsApp");
            }
        } catch (err) {
            toast.error("Network error while sending WhatsApp");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <History className="text-emerald-500" /> Collection History
                </h1>
                <p className="text-slate-400">View successfully collected overdue payments & receipts</p>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search Client Name, Bill Number or Receipt ID/No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
                />
            </div>

            <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0f172a] text-slate-300">
                            <tr>
                                <th className="p-4 rounded-tl-xl font-medium">Receipt Info</th>
                                <th className="p-4 font-medium">Client Info</th>
                                <th className="p-4 font-medium">Collection Details</th>
                                <th className="p-4 font-medium">WhatsApp Status</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 rounded-tr-xl font-medium min-w-[200px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Loading history...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        <History className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                                        <p>No collection history found</p>
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.receipt_id} className="hover:bg-slate-800/50 transition-colors text-sm">
                                        <td className="p-4">
                                            <div className="font-bold text-white mb-1">{item.receipt_number || `Receipt #${item.receipt_id}`}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <FileText size={12} /> Bill #{item.bill_number}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{item.client_name}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Phone size={10} /> {item.client_phone}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-emerald-400">₹{parseFloat(item.collected_amount).toLocaleString()}</div>
                                            <div className="text-xs text-slate-500 mt-1">Method: {item.payment_method}</div>
                                            <div className="text-xs text-slate-500">Left: ₹{parseFloat(item.remaining_balance).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-max ${item.whatsapp_status === 'Sent' ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                                                'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {item.whatsapp_status === 'Sent' ? <CheckCircle2 size={12} /> : null} {item.whatsapp_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewReceipt(item)}
                                                    title="View Receipt"
                                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReceipt(item)}
                                                    title="Download Receipt"
                                                    className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/20 rounded-lg transition-colors"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrintReceipt(item)}
                                                    title="Print Receipt"
                                                    className="p-2 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border border-orange-500/20 rounded-lg transition-colors"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSendWhatsApp(item.receipt_id)}
                                                    disabled={actionLoading === item.receipt_id}
                                                    title="Send WhatsApp"
                                                    className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CollectionHistory;
