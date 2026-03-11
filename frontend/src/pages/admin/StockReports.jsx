import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FileText, Download, Printer, TrendingUp,
    AlertCircle, ShoppingCart, Calendar, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SEO from '../../components/common/SEO';

const StockReports = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('inventory'); // inventory, restock

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost/sales_manage/backend/api/stock.php');
            if (res.data.success) {
                setStockData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch reports data", err);
        } finally {
            setLoading(false);
        }
    };

    const restockItems = stockData.filter(item => {
        const qty = parseFloat(item.stock_quantity);
        const min = parseFloat(item.min_stock_level || 5);
        return qty <= min;
    });

    const getStatus = (qty, min) => {
        if (qty <= 0) return { label: 'Out of Stock', class: 'bg-red-500/10 text-red-500' };
        if (qty <= min) return { label: 'Low Stock', class: 'bg-yellow-500/10 text-yellow-500' };
        return { label: 'Normal', class: 'bg-emerald-500/10 text-emerald-500' };
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const title = reportType === 'inventory' ? 'Master Inventory List' : 'Priority Restock List';
        const date = new Date().toLocaleDateString();

        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("SalesManage ERP", 14, 22);
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(title, 14, 32);
        doc.setFontSize(10);
        doc.text(`Generated on: ${date}`, 14, 40);

        const tableColumn = reportType === 'inventory'
            ? ["Product Name", "Supplier", "Stock", "Min. Level", "Status"]
            : ["Product Name", "Supplier", "Stock", "To Order", "Min. Level", "Status"];

        const tableRows = (reportType === 'inventory' ? stockData : restockItems).map(item => {
            const status = getStatus(item.stock_quantity, item.min_stock_level || 5);
            const row = [
                item.name,
                item.supplier_name || 'Generic Provider',
                `${item.stock_quantity} units`,
                item.min_stock_level || 5,
                status.label
            ];
            if (reportType === 'restock') {
                const recommendedOrder = Math.max(0, (item.min_stock_level * 2) - item.stock_quantity);
                row.splice(3, 0, `+${recommendedOrder}`);
            }
            return row;
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], textColor: 255 },
            styles: { fontSize: 9 }
        });

        doc.save(`Stock_Report_${reportType}_${date.replace(/\//g, '-')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 print:p-0 print:bg-white print:text-black">
            <SEO title="Inventory Reports" description="Detailed stock and restocking analysis reports." />

            {/* Report Selection (Hidden on print) */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Inventory Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Generate and analyze stock movements and requirements.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                    >
                        <Printer size={18} />
                        Print Page
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/20"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </header>

            {/* Toggle Switch (Hidden on print) */}
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit mb-8 print:hidden">
                <button
                    onClick={() => setReportType('inventory')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${reportType === 'inventory' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <FileText size={18} />
                    Full Inventory Report
                </button>
                <button
                    onClick={() => setReportType('restock')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${reportType === 'restock' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <ShoppingCart size={18} />
                    Restock Requirements
                    {restockItems.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                            {restockItems.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Report Content */}
            <motion.div
                key={reportType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl backdrop-blur-md"
            >
                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center border-b pb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-widest text-slate-800">SalesManage ERP</h1>
                    <p className="text-gray-500 mt-2">Official Inventory Status Report</p>
                    <div className="flex justify-between items-center mt-6 text-sm">
                        <span>Report Type: <span className="font-bold">{reportType === 'inventory' ? 'Full Inventory' : 'Restock Requirements'}</span></span>
                        <span>Date Generated: <span className="font-bold font-mono">{new Date().toLocaleDateString()}</span></span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8 print:mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white print:text-black">
                            {reportType === 'inventory' ? 'Master Inventory List' : 'Priority Restock List'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 print:text-gray-600">
                            {reportType === 'inventory'
                                ? `Displaying status of all ${stockData.length} items in the system.`
                                : `Targeted report for ${restockItems.length} items requiring immediate attention.`}
                        </p>
                    </div>

                    <div className="flex gap-4 print:hidden">
                        <div className="bg-slate-900/50 border border-slate-700/50 px-5 py-3 rounded-2xl">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Total Value</p>
                            <p className="text-xl font-bold font-mono text-emerald-400">₹ {(stockData.reduce((acc, i) => acc + (parseFloat(i.stock_quantity) * parseFloat(i.purchase_price || 0)), 0)).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-700 print:bg-gray-100 print:border-black">
                                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Product Name</th>
                                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Supplier / Vendor</th>
                                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Current Stock</th>
                                {reportType === 'restock' && (
                                    <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Recommended Order</th>
                                )}
                                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Min. Level</th>
                                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 print:text-black">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 print:divide-gray-300">
                            {(reportType === 'inventory' ? stockData : restockItems).map((item, idx) => {
                                const status = getStatus(item.stock_quantity, item.min_stock_level || 5);
                                const recommendedOrder = Math.max(0, (item.min_stock_level * 2) - item.stock_quantity);

                                return (
                                    <tr key={idx} className="hover:bg-slate-700/10 transition-colors print:hover:bg-transparent">
                                        <td className="px-4 py-5">
                                            <p className="font-bold text-slate-200 print:text-black">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{item.sku || 'SERIAL-PENDING'}</p>
                                        </td>
                                        <td className="px-4 py-5 text-slate-400 print:text-black">
                                            {item.supplier_name || 'Generic Provider'}
                                        </td>
                                        <td className="px-4 py-5">
                                            <p className={`text-lg font-bold font-mono ${parseFloat(item.stock_quantity) < 0 ? 'text-red-500 bg-red-500/10 px-2 rounded w-fit' : status.class.split(' ')[1]}`}>
                                                {item.stock_quantity}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-slate-600">units</p>
                                        </td>
                                        {reportType === 'restock' && (
                                            <td className="px-4 py-5">
                                                <p className="text-lg font-bold text-cyan-400 font-mono">+{recommendedOrder}</p>
                                                <p className="text-[10px] uppercase font-bold text-slate-600">to reorder</p>
                                            </td>
                                        )}
                                        <td className="px-4 py-5 text-slate-500 font-mono">
                                            {item.min_stock_level || 5}
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Report Footer */}
                <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-700/50 print:border-black">
                    <div className="text-xs text-slate-500 italic">
                        * Generated automatically by SalesManage Cloud Infrastructure.
                    </div>
                    <div className="text-right hidden print:block">
                        <div className="h-16 w-32 border-b border-black mb-1 ml-auto"></div>
                        <p className="text-xs font-bold uppercase">Authorized Signature</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StockReports;
